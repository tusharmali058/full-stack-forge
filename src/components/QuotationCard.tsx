import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, DollarSign, FileText } from "lucide-react";
import { format } from "date-fns";

interface QuotationCardProps {
  quotation: {
    id: string;
    destination: string;
    travel_start_date: string;
    travel_end_date: string;
    number_of_adults: number;
    number_of_children: number;
    status: string;
    total_amount: number;
    customer: {
      name: string;
    };
    created_at: string;
  };
  onView: () => void;
}

const QuotationCard = ({ quotation, onView }: QuotationCardProps) => {
  const statusColors = {
    draft: "bg-muted text-muted-foreground",
    sent: "bg-accent/20 text-accent-foreground",
    approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-destructive/20 text-destructive-foreground",
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              {quotation.destination}
            </h3>
            <p className="text-sm text-muted-foreground">{quotation.customer.name}</p>
          </div>
          <Badge className={statusColors[quotation.status as keyof typeof statusColors]}>
            {quotation.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(quotation.travel_start_date), "MMM dd")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>
              {quotation.number_of_adults}A
              {quotation.number_of_children > 0 && `, ${quotation.number_of_children}C`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-lg font-semibold text-primary">
          <DollarSign className="w-5 h-5" />
          <span>${quotation.total_amount.toLocaleString()}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onView} className="w-full" variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuotationCard;
