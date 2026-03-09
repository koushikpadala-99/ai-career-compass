import { Compass } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-border bg-card mt-auto">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg gradient-text">AI Career Compass</span>
          </div>
          <p className="text-sm text-muted-foreground">AI-powered career guidance for every path. Discover, learn, and grow.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Platform</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="hover:text-foreground cursor-pointer transition-colors">Career Quiz</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Career Explorer</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Study Tools</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Roadmaps</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Resources</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="hover:text-foreground cursor-pointer transition-colors">Blog</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Documentation</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Career Guides</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">FAQ</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Company</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="hover:text-foreground cursor-pointer transition-colors">About</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Privacy</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Terms</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Contact</p>
          </div>
        </div>
      </div>
      <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
        © 2026 AI Career Compass. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
