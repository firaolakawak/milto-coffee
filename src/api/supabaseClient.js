import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local.',
    );
  }
}

function unwrapEntity(row) {
  if (!row) return row;
  return {
    ...(row.data || {}),
    id: row.id,
    created_by_id: row.created_by_id,
    created_date: row.created_at,
    updated_date: row.updated_at,
  };
}

function unwrapProfile(row, authUser) {
  if (!row && !authUser) return null;
  return {
    ...(authUser?.user_metadata || {}),
    ...(row?.data || {}),
    id: row?.id || authUser?.id,
    email: row?.email || authUser?.email,
    role: row?.role || 'customer',
    created_date: row?.created_at || authUser?.created_at,
  };
}

function throwIfError(error) {
  if (error) throw error;
}

function matchesFilter(item, filters) {
  return Object.entries(filters || {}).every(([key, value]) => item?.[key] === value);
}

function sortItems(items, sort) {
  if (!sort) return items;
  const descending = sort.startsWith('-');
  const field = descending ? sort.slice(1) : sort;

  return [...items].sort((left, right) => {
    const a = left?.[field];
    const b = right?.[field];
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    const result = typeof a === 'number' && typeof b === 'number'
      ? a - b
      : String(a).localeCompare(String(b), undefined, { numeric: true });
    return descending ? -result : result;
  });
}

async function currentUser() {
  assertConfigured();
  const { data, error } = await supabase.auth.getUser();
  throwIfError(error);
  return data.user;
}

async function currentProfile() {
  const authUser = await currentUser();
  if (!authUser) throw new Error('Authentication required');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();
  throwIfError(error);
  return unwrapProfile(data, authUser);
}

function entityApi(entityType) {
  const fetchRows = async () => {
    assertConfigured();

    if (entityType === 'User') {
      const { data, error } = await supabase.from('profiles').select('*');
      throwIfError(error);
      return (data || []).map(row => unwrapProfile(row));
    }

    const { data, error } = await supabase
      .from('app_entities')
      .select('*')
      .eq('entity_type', entityType);
    throwIfError(error);
    return (data || []).map(unwrapEntity);
  };

  return {
    async list(sort, limit) {
      const items = sortItems(await fetchRows(), sort);
      return limit ? items.slice(0, limit) : items;
    },

    async filter(filters, sort, limit) {
      const items = sortItems((await fetchRows()).filter(item => matchesFilter(item, filters)), sort);
      return limit ? items.slice(0, limit) : items;
    },

    async create(values) {
      assertConfigured();
      if (entityType === 'User') throw new Error('Users must be created through Supabase Auth.');

      const { data: authData } = await supabase.auth.getUser();
      const createdById = values.created_by_id || authData.user?.id || null;
      const { data, error } = await supabase
        .from('app_entities')
        .insert({ entity_type: entityType, created_by_id: createdById, data: values })
        .select()
        .single();
      throwIfError(error);
      return unwrapEntity(data);
    },

    async update(id, values) {
      assertConfigured();
      if (entityType === 'User') throw new Error('Use auth.updateMe() to update a profile.');

      if (entityType === 'Event' && Object.keys(values).length === 1 && 'registered_count' in values) {
        const { data, error } = await supabase.rpc('set_event_registration_count', {
          entity_id: id,
          new_count: values.registered_count,
        });
        throwIfError(error);
        return unwrapEntity(data);
      }

      const { data: current, error: readError } = await supabase
        .from('app_entities')
        .select('data')
        .eq('entity_type', entityType)
        .eq('id', id)
        .single();
      throwIfError(readError);

      const { data, error } = await supabase
        .from('app_entities')
        .update({ data: { ...(current?.data || {}), ...values } })
        .eq('entity_type', entityType)
        .eq('id', id)
        .select()
        .single();
      throwIfError(error);
      return unwrapEntity(data);
    },

    async delete(id) {
      assertConfigured();
      const { error } = await supabase
        .from('app_entities')
        .delete()
        .eq('entity_type', entityType)
        .eq('id', id);
      throwIfError(error);
    },

    subscribe(callback) {
      assertConfigured();
      const channel = supabase
        .channel(`entity:${entityType}:${crypto.randomUUID()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'app_entities', filter: `entity_type=eq.${entityType}` },
          payload => {
            const row = payload.new?.id ? payload.new : payload.old;
            callback({
              id: row?.id,
              type: payload.eventType.toLowerCase(),
              data: payload.eventType === 'DELETE' ? null : unwrapEntity(payload.new),
            });
          },
        )
        .subscribe();

      return () => { void supabase.removeChannel(channel); };
    },
  };
}

const entities = new Proxy({}, {
  get: (_, entityType) => entityApi(String(entityType)),
});

export const backend = {
  auth: {
    me: currentProfile,

    async loginViaEmailPassword(email, password) {
      assertConfigured();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      throwIfError(error);
      return data;
    },

    async register({ email, password }) {
      assertConfigured();
      const { data, error } = await supabase.auth.signUp({ email, password });
      throwIfError(error);
      return data;
    },

    async verifyOtp({ email, otpCode }) {
      assertConfigured();
      const { data, error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'signup' });
      throwIfError(error);
      return data.session || data;
    },

    async resendOtp(email) {
      assertConfigured();
      const { data, error } = await supabase.auth.resend({ type: 'signup', email });
      throwIfError(error);
      return data;
    },

    setToken() {
      // verifyOtp already persists the returned Supabase session.
    },

    async updateMe(values) {
      const user = await currentUser();
      if (!user) throw new Error('Authentication required');

      const { data: current, error: readError } = await supabase
        .from('profiles')
        .select('data')
        .eq('id', user.id)
        .maybeSingle();
      throwIfError(readError);

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          data: { ...(current?.data || {}), ...values },
        })
        .select()
        .single();
      throwIfError(error);
      return unwrapProfile(data, user);
    },

    async loginWithProvider(provider, returnTo = '/') {
      assertConfigured();
      const redirectTo = new URL(returnTo, window.location.origin).toString();
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
      throwIfError(error);
    },

    async resetPasswordRequest(email) {
      assertConfigured();
      const redirectTo = new URL('/reset-password', window.location.origin).toString();
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      throwIfError(error);
      return data;
    },

    async resetPassword({ newPassword }) {
      assertConfigured();
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      throwIfError(error);
      return data;
    },

    async logout(redirect = true) {
      const { error } = await supabase.auth.signOut();
      throwIfError(error);
      if (redirect) window.location.assign('/login');
    },

    redirectToLogin(returnTo = window.location.href) {
      const url = new URL('/login', window.location.origin);
      url.searchParams.set('returnTo', returnTo);
      window.location.assign(url);
    },
  },

  entities,

  integrations: {
    Core: {
      async UploadFile({ file }) {
        assertConfigured();
        const { data: authData } = await supabase.auth.getUser();
        const owner = authData.user?.id || 'public';
        const extension = file.name?.split('.').pop() || 'bin';
        const path = `${owner}/${crypto.randomUUID()}.${extension}`;
        const { error } = await supabase.storage.from('assets').upload(path, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false,
        });
        throwIfError(error);
        const { data } = supabase.storage.from('assets').getPublicUrl(path);
        return { file_url: data.publicUrl };
      },

      async SendEmail(payload) {
        const { data, error } = await supabase.functions.invoke('send-email', { body: payload });
        throwIfError(error);
        return data;
      },
    },
  },

  functions: {
    async invoke(name, payload) {
      assertConfigured();
      const { data, error } = await supabase.functions.invoke(name, { body: payload });
      throwIfError(error);
      return data;
    },
  },
};
