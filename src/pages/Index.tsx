import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import QuotationCard from "@/components/QuotationCard";
import NewQuotationDialog from "@/components/NewQuotationDialog";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchQuotations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("quotations")
      .select(`
        *,
        customer:customers(name, email)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setQuotations(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchQuotations();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <DashboardHeader userEmail={user.email} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Quotations</h2>
            <p className="text-muted-foreground">Manage your travel quotations</p>
          </div>
          <Button onClick={() => setShowNewDialog(true)} size="lg" className="shadow-lg">
            <Plus className="w-5 h-5 mr-2" />
            New Quotation
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-card animate-pulse rounded-lg" />
            ))}
          </div>
        ) : quotations.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No quotations yet</h3>
            <p className="text-muted-foreground mb-6">Create your first quotation to get started</p>
            <Button onClick={() => setShowNewDialog(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Create First Quotation
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quotations.map((quotation) => (
              <QuotationCard
                key={quotation.id}
                quotation={quotation}
                onView={() => navigate(`/quotation/${quotation.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      <NewQuotationDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSuccess={fetchQuotations}
        userId={user.id}
      />
    </div>
  );
};

export default Index;
