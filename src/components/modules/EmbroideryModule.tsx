import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmbroideryItem {
  id: string;
  job_description: string;
  quotation: number;
  deposit: number;
  balance: number;
  quantity: number;
  rate: number;
  expenditure: number;
  profit: number;
  sales: number;
  date: string;
}


interface EmbroideryModuleProps { openAddTrigger?: number }
const EmbroideryModule = ({ openAddTrigger }: EmbroideryModuleProps) => {
  const [items, setItems] = useState<EmbroideryItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    job_description: "",
    quotation: "",
    deposit: "",
    quantity: "1",
    rate: "",
    expenditure: "",
  });
  const { toast } = useToast();

  // Open the add dialog when triggered from Dashboard
  useEffect(() => {
    if (openAddTrigger) {
      setIsDialogOpen(true);
    }
  }, [openAddTrigger]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("embroidery")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching embroidery jobs",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setItems(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("embroidery").insert([
      {
        job_description: formData.job_description,
        quotation: parseFloat(formData.quotation),
        deposit: parseFloat(formData.deposit || "0"),
        quantity: parseInt(formData.quantity || "1"),
        rate: parseFloat(formData.rate || "0"),
        expenditure: parseFloat(formData.expenditure),
      },
    ]);

    if (error) {
      toast({
        title: "Error adding embroidery job",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Embroidery job added successfully",
      });
      setIsDialogOpen(false);
      setFormData({
        job_description: "",
        quotation: "",
        deposit: "",
        quantity: "1",
        rate: "",
        expenditure: "",
      });
      fetchItems();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Embroidery Services</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Embroidery Job</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="job_description">Job Description</Label>
                <Textarea
                  id="job_description"
                  value={formData.job_description}
                  onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rate">Rate (UGX)</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quotation">Quotation (UGX)</Label>
                  <Input
                    id="quotation"
                    type="number"
                    step="0.01"
                    value={formData.quotation}
                    onChange={(e) => setFormData({ ...formData, quotation: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deposit">Deposit (UGX)</Label>
                  <Input
                    id="deposit"
                    type="number"
                    step="0.01"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="expenditure">Expenditure (UGX)</Label>
                <Input
                  id="expenditure"
                  type="number"
                  step="0.01"
                  value={formData.expenditure}
                  onChange={(e) => setFormData({ ...formData, expenditure: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Add Job</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Embroidery Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Rate (UGX)</TableHead>
                <TableHead>Quotation (UGX)</TableHead>
                <TableHead>Deposit (UGX)</TableHead>
                <TableHead>Balance (UGX)</TableHead>
                <TableHead>Expenditure (UGX)</TableHead>
                <TableHead>Profit (UGX)</TableHead>
                <TableHead>Sales (UGX)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-xs truncate">{item.job_description}</TableCell>
                    <TableCell>UGX {item.quotation}</TableCell>
                    <TableCell>UGX {item.expenditure}</TableCell>
                    <TableCell className="font-semibold text-green-600">UGX {item.profit}</TableCell>
                    <TableCell className="font-semibold">UGX {item.sales}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No embroidery jobs found. Add your first job above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmbroideryModule;