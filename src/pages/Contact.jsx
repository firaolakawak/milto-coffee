import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Please fill in all fields'); return; }
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: 'info@miltocoffe.com',
      subject: `Contact form: ${form.name}`,
      body: `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`,
    });
    toast.success('Message sent! We\'ll get back to you soon.');
    setForm({ name: '', email: '', message: '' });
    setSending(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-primary mb-2">Contact Us</h1>
      <p className="text-muted-foreground mb-10">We'd love to hear from you. Reach out any time.</p>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Contact info */}
        <div className="space-y-6">
          <h2 className="font-semibold text-lg">Get in Touch</h2>

          {[
            { icon: Mail,    label: 'Email',   value: 'info@miltocoffe.com',   href: 'mailto:info@miltocoffe.com' },
            { icon: Phone,   label: 'Phone',   value: '+251 911 708 622',      href: 'tel:+251911708622' },
            { icon: MapPin,  label: 'Address', value: 'Addis Ababa, Ethiopia', href: null },
          ].map(item => (
            <div key={item.label} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center shrink-0">
                <item.icon className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="font-medium text-sm hover:text-secondary transition-colors">{item.value}</a>
                ) : (
                  <p className="font-medium text-sm">{item.value}</p>
                )}
              </div>
            </div>
          ))}

          <div>
            <p className="text-xs text-muted-foreground mb-3">Follow Us</p>
            <div className="flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center hover:bg-secondary/25 transition-colors">
                <Instagram className="h-5 w-5 text-secondary" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center hover:bg-secondary/25 transition-colors">
                <Facebook className="h-5 w-5 text-secondary" />
              </a>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
          <h2 className="font-semibold text-lg mb-2">Send a Message</h2>
          <div>
            <Label className="text-sm">Your Name</Label>
            <Input className="mt-1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Abebe Girma" />
          </div>
          <div>
            <Label className="text-sm">Email Address</Label>
            <Input className="mt-1" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
          </div>
          <div>
            <Label className="text-sm">Message</Label>
            <textarea
              className="mt-1 w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="How can we help you?"
            />
          </div>
          <Button type="submit" disabled={sending} className="w-full rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
            {sending ? 'Sending…' : 'Send Message'}
          </Button>
        </form>
      </div>
    </div>
  );
}