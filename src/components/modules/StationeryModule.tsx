import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Search, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StationeryDailySales from "./StationeryDailySales";

const CATEGORIES = [
  "Office Supplies",
  "School Supplies",
  "Art Materials",
  "Writing Instruments",
  "Paper Products",
  "Desk Accessories"
];

const formatUGX = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "UGX 0";
  return `UGX ${amount.toLocaleString()}`;
};

interface StationeryItem {
  id: string;
  category: string;
  item: string;
  description: string | null;
  quantity: number;
  rate: number;
  stock: number;
  selling_price: number;
  date: string;
  sold_by: string | null;
  low_stock_threshold: number;
  profit_per_unit: number;
}

interface StationeryModuleProps { openAddTrigger?: number }
const StationeryModule = ({ openAddTrigger }: StationeryModuleProps) => {
  const [items, setItems] = useState<StationeryItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    category: CATEGORIES[0],
    item: "",
    description: "",
    quantity: "",
    rate: "",
    selling_price: "",
    profit_per_unit: "0",
    low_stock_threshold: "5",
  });
  const { toast } = useToast();

  // Filter items based on search
  const filteredItems = items.filter(item => 
    item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate profit when rate or selling price changes
  useEffect(() => {
    if (formData.rate && formData.selling_price) {
      const rate = parseFloat(formData.rate) || 0;
      const sellingPrice = parseFloat(formData.selling_price) || 0;
      const profit = sellingPrice - rate;
      setFormData(prev => ({
        ...prev,
        profit_per_unit: profit.toFixed(2)
      }));
    }
  }, [formData.rate, formData.selling_price]);

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
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("stationery")
        .select("*")
        .order("category", { ascending: true })
        .order("item", { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      toast({
        title: "Error fetching items",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: StationeryItem) => {
    setEditingId(item.id);
    setFormData({
      category: item.category || CATEGORIES[0],
      item: item.item,
      description: item.description || "",
      quantity: item.quantity.toString(),
      rate: item.rate.toString(),
      selling_price: item.selling_price.toString(),
      profit_per_unit: item.profit_per_unit?.toString() || "0",
      low_stock_threshold: item.low_stock_threshold?.toString() || "5",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      const { error } = await supabase
        .from("stationery")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item deleted successfully",
      });

      fetchItems();
    } catch (error) {
      toast({
        title: "Error deleting item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const itemData = {
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
        rate: parseFloat(formData.rate) || 0,
        selling_price: parseFloat(formData.selling_price) || 0,
        profit_per_unit: parseFloat(formData.profit_per_unit) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 5,
        stock: parseInt(formData.quantity) || 0,
      };

      if (editingId) {
        // Update existing item
        const { error } = await supabase
          .from("stationery")
          .update(itemData)
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Item updated successfully",
        });
      } else {
        // Create new item
        const { error } = await supabase
          .from("stationery")
          .insert([itemData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Item added successfully",
        });
      }

      setIsDialogOpen(false);
      setFormData({
        category: CATEGORIES[0],
        item: "",
        description: "",
        quantity: "",
        rate: "",
        selling_price: "",
        profit_per_unit: "0",
        low_stock_threshold: "5",
      });
      setEditingId(null);
      fetchItems();
    } catch (error) {
      toast({
        title: editingId ? "Error updating item" : "Error adding item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      category: CATEGORIES[0],
      item: "",
      description: "",
      quantity: "",
      rate: "",
      selling_price: "",
      profit_per_unit: "0",
      low_stock_threshold: "5",
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="daily-sales">Daily Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold">Stationery Management</h3>
              <div className="flex items-center gap-4">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingId ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({...formData, category: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Item Name *</Label>
                        <Input
                          value={formData.item}
                          onChange={(e) => setFormData({...formData, item: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Quantity *</Label>
                          <Input
                            type="number"
                            min="0"
                            value={formData.quantity}
                            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Rate (UGX) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.rate}
                            onChange={(e) => setFormData({...formData, rate: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Selling Price (UGX) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.selling_price}
                            onChange={(e) => setFormData({...formData, selling_price: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Profit/Unit (UGX)</Label>
                          <Input
                            value={formData.profit_per_unit}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Low Stock Threshold</Label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.low_stock_threshold}
                          onChange={(e) => setFormData({...formData, low_stock_threshold: e.target.value})}
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Saving...' : editingId ? 'Update Item' : 'Add Item'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stationery Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Rate (UGX)</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Profit/Unit</TableHead>
                    <TableHead>Stock Date</TableHead>
                    <TableHead>Stock Alert</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                      const isLowStock = item.stock <= item.low_stock_threshold;
                      return (
                        <TableRow key={item.id} className={isLowStock ? "bg-red-50" : ""}>
                          <TableCell>{item.category || "-"}</TableCell>
                          <TableCell className="font-medium">{item.item}</TableCell>
                          <TableCell>{item.description || "-"}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatUGX(item.rate)}</TableCell>
                          <TableCell className={isLowStock ? "text-red-600 font-semibold" : ""}>
                            {item.stock}
                          </TableCell>
                          <TableCell>{formatUGX(item.selling_price)}</TableCell>
                          <TableCell className={item.profit_per_unit >= 0 ? "text-green-600" : "text-red-600"}>
                            {formatUGX(item.profit_per_unit)}
                          </TableCell>
                          <TableCell>
                            {new Date(item.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {isLowStock ? (
                              <div className="flex items-center gap-1 text-red-600">
                                <AlertTriangle className="h-4 w-4" />
                                <span>{item.stock} left</span>
                              </div>
                            ) : (
                              <span className="text-green-600">Good</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="h-24 text-center">
                        {isLoading ? "Loading..." : "No items found."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily-sales">
          <StationeryDailySales items={items} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StationeryModule;