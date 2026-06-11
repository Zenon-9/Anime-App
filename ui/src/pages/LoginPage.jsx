import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage({ setCurrentPage }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Small artificial delay to look professional
      await new Promise(r => setTimeout(r, 600));
      login(identifier, password);
      setCurrentPage('home');
    } catch (err) {
      setError(err.message || 'Failed to log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4 animate-fade-in">
      <Card className="w-full max-w-md glass-panel border-muted shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-[40px] -z-10"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-[40px] -z-10"></div>

        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
          <CardDescription>
            Log in to access your watchlists and tracking analytics
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive text-sm font-medium">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="identifier" className="text-sm font-semibold text-card-foreground">
                Email or Username
              </label>
              <Input
                id="identifier"
                type="text"
                placeholder="you@example.com or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-semibold text-card-foreground">
                  Password
                </label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="mr-2" size={16} />
              <span>{loading ? 'Logging in...' : 'Log In'}</span>
            </Button>
            
            <div className="text-xs text-center text-muted-foreground w-full border-t pt-4 mt-2">
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={() => setCurrentPage('signup')}
                className="text-primary hover:underline font-semibold"
              >
                Sign Up
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
