import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Leaf, Heart, MapPin } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-primary mb-4">About Milto Coffee</h1>
      <p className="text-lg text-muted-foreground mb-10">From Ethiopia's Finest Farms to Your Cup.</p>

      <div className="prose prose-slate max-w-none space-y-6 text-foreground/90 leading-relaxed">
        <p>
          Milto Coffee is an Ethiopian specialty coffee brand dedicated to celebrating the rich heritage and
          extraordinary flavors of Ethiopian coffee culture. We source our beans directly from small-scale
          farmers across the iconic coffee-growing regions of Yirgacheffe, Sidama, Guji, and Harrar — regions
          that gave coffee to the world thousands of years ago.
        </p>
        <p>
          Our app was built for coffee lovers who want more than just a cup — it's for those who want to
          experience the story behind every sip. Whether you're ordering your daily macchiato, exploring the
          origins of our single-origin beans, joining one of our brewing workshops, or tracking your order
          in real time, Milto Coffee brings the full Ethiopian coffee experience to your fingertips.
        </p>
        <p>
          Through our loyalty rewards program, regular customers earn points with every purchase and unlock
          exclusive perks, free drinks, and early access to special events. We believe great coffee should
          come with great value — and a community that celebrates it.
        </p>
        <p>
          Milto Coffee is proudly built and operated by a passionate team based in Addis Ababa, Ethiopia.
          Our mission is to connect local farmers with global coffee enthusiasts, support sustainable
          agriculture, and preserve the centuries-old traditions of Ethiopian coffee ceremony — all while
          delivering a modern, seamless café experience.
        </p>
        <p>
          Whether you visit one of our branches across the city or order through the app, you can expect
          carefully crafted beverages, warm hospitality, and an unwavering commitment to quality.
          Welcome to Milto Coffee — where every cup tells a story.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {[
          { icon: Coffee, title: 'Specialty Coffee', desc: 'Ethipian single-origin beans, expertly roasted.' },
          { icon: Leaf,   title: 'Sustainable',      desc: 'Direct trade with local farmers for a fairer future.' },
          { icon: Heart,  title: 'Community',        desc: 'Events, workshops, and a loyalty program built for you.' },
          { icon: MapPin, title: 'Multi-Branch',     desc: 'Find us across Addis Ababa and beyond.' },
        ].map(item => (
          <div key={item.title} className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center mb-3">
              <item.icon className="h-5 w-5 text-secondary" />
            </div>
            <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex gap-3">
        <Link to="/menu" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors">
          Explore Our Menu
        </Link>
        <Link to="/contact" className="inline-flex items-center gap-2 border border-border px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-muted transition-colors">
          Contact Us
        </Link>
      </div>
    </div>
  );
}