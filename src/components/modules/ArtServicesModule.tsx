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

const formatUGX = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "UGX 0";
  return `UGX ${amount.toLocaleString()}`;
};

interface ArtService {
  id: string;
  service_name: string;
  description: string | null;
  quantity: number;
  rate: number;
  quotation: number;
  deposit: number;
  balance: number;
  expenditure: number;
  sales: number;
  profit: number;
  done_by: string | null;
  date: string;
}


interface ArtServicesModuleProps { openAddTrigger?: number }
const ArtServicesModule = ({ openAddTrigger }: ArtServicesModuleProps) => {
  const [items, setItems] = useState<ArtService[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    service_name: "",
    description: "",
    quantity: "",
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
      .from("art_services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching art services",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setItems(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("art_services").insert([
      {
        service_name: formData.service_name,
        description: formData.description || null,
        quantity: parseInt(formData.quantity),
        rate: parseFloat(formData.rate),
        expenditure: parseFloat(formData.expenditure),
      },
    ]);

    if (error) {
      toast({
        title: "Error adding art service",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Art service added successfully",
      });
      setIsDialogOpen(false);
      setFormData({
        service_name: "",
        description: "",
        quantity: "",
        rate: "",
        expenditure: "",
      });
      fetchItems();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Art Services</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Art Service</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="service_name">Service Name</Label>
                <Input
                  id="service_name"
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              </div>
              <Button type="submit" className="w-full">Add Service</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Art Services</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Rate (UGX)</TableHead>
                <TableHead>Quotation (UGX)</TableHead>
                <TableHead>Deposit (UGX)</TableHead>
                <TableHead>Balance (UGX)</TableHead>
                <TableHead>Expenditure (UGX)</TableHead>
                <TableHead>Profit (UGX)</TableHead>
                <TableHead>Sales By</TableHead>
                <TableHead>Date of Service</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.service_name}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.description || "-"}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatUGX(item.rate)}</TableCell>
                    <TableCell className="font-semibold text-green-600">{formatUGX(item.quotation)}</TableCell>
                    <TableCell>{formatUGX(item.deposit)}</TableCell>
                    <TableCell>{formatUGX(item.balance)}</TableCell>
                    <TableCell>{formatUGX(item.expenditure)}</TableCell>
                    <TableCell className="font-semibold text-green-600">{formatUGX(item.profit)}</TableCell>
                    <TableCell>{item.done_by || "-"}</TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" aria-label="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} className="text-center text-muted-foreground">
                    No art services found. Add your first service above.
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

export default ArtServicesModule;