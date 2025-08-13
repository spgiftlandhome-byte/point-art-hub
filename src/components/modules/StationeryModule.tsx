import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

const formatUGX = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "UGX 0";
  return `UGX ${amount.toLocaleString()}`;
};

interface StationeryItem {
  id: string;
  item: string;
  description: string | null;
  quantity: number;
  rate: number;
  stock: number;
  selling_price: number;
  sales: number;
  date: string;
  sold_by: string | null;
  low_stock_threshold: number;
  profit_per_unit: number;
}


interface StationeryModuleProps { openAddTrigger?: number }
const StationeryModule = ({ openAddTrigger }: StationeryModuleProps) => {
  const [items, setItems] = useState<StationeryItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    item: "",
    description: "",
    quantity: "",
    rate: "",
    selling_price: "",
    low_stock_threshold: "",
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
      .from("stationery")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching stationery items",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setItems(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("stationery").insert([
      {
        item: formData.item,
        description: formData.description || null,
        quantity: parseInt(formData.quantity),
        rate: parseFloat(formData.rate),
        selling_price: parseFloat(formData.selling_price),
        low_stock_threshold: parseInt(formData.low_stock_threshold || "0"),
      },
    ]);

    if (error) {
      toast({
        title: "Error adding item",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Stationery item added successfully",
      });
      setIsDialogOpen(false);
      setFormData({
        item: "",
        description: "",
        quantity: "",
        rate: "",
        selling_price: "",
        low_stock_threshold: "",
      });
      fetchItems();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Stationery Management</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Stationery Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="item">Item Name</Label>
                <Input
                  id="item"
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
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
              <div>
                <Label htmlFor="selling_price">Selling Price (UGX)</Label>
                <Input
                  id="selling_price"
                  type="number"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                <Input
                  id="low_stock_threshold"
                  type="number"
                  value={formData.low_stock_threshold}
                  onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">Add Item</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stationery Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Rate (UGX)</TableHead>
                <TableHead>Stock (UGX)</TableHead>
                <TableHead>Selling Price (UGX)</TableHead>
                <TableHead>Profit/Unit (UGX)</TableHead>
                <TableHead>Sales (UGX)</TableHead>
                <TableHead>Sales By</TableHead>
                <TableHead>Date Sold</TableHead>
                <TableHead>Low Stock Alert</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const isLowStock = item.stock <= item.low_stock_threshold;
                return (
                  <TableRow key={item.id} className={isLowStock ? "bg-red-50 dark:bg-red-900/20" : ""}>
                    <TableCell className="font-medium">{item.item}</TableCell>
                    <TableCell>{item.description || "-"}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatUGX(item.rate)}</TableCell>
                    <TableCell className="font-semibold text-green-600">{formatUGX(item.stock)}</TableCell>
                    <TableCell>{formatUGX(item.selling_price)}</TableCell>
                    <TableCell>{formatUGX(item.profit_per_unit)}</TableCell>
                    <TableCell className="font-semibold">{formatUGX(item.sales)}</TableCell>
                    <TableCell>{item.sold_by || "-"}</TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {isLowStock ? (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-xs">Low Stock</span>
                        </div>
                      ) : (
                        <span className="text-green-600 text-xs">Good</span>
                      )}
                    </TableCell>
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
                );
              })}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} className="text-center text-muted-foreground">
                    No stationery items found. Add your first item above.
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

export default StationeryModule;