import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";
import GiftsDailySales from "./GiftsDailySales";

const formatUGX = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "UGX 0";
  return `UGX ${amount.toLocaleString()}`;
};

interface GiftStoreItem {
  id: string;
  item: string;
  category: string;
  custom_category: string | null;
  quantity: number;
  rate: number;
  stock: number;
  selling_price: number;
  profit_per_unit: number;
  low_stock_threshold: number;
  sales: number;
  sold_by: string | null;
  date: string;
}


interface GiftStoreModuleProps { openAddTrigger?: number }
const GiftStoreModule = ({ openAddTrigger }: GiftStoreModuleProps) => {
  const [items, setItems] = useState<GiftStoreItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    item: "",
    category: "cleaning",
    custom_category: "",
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
      .from("gift_store")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching gift store items",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setItems(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("gift_store").insert([
      {
        item: formData.item,
        category: formData.category as "cleaning" | "kids_toys" | "birthday" | "custom",
        custom_category: formData.category === "custom" ? formData.custom_category : null,
        quantity: parseInt(formData.quantity),
        rate: parseFloat(formData.rate),
        selling_price: parseFloat(formData.selling_price || "0"),
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
        description: "Gift store item added successfully",
      });
      setIsDialogOpen(false);
      setFormData({
        item: "",
        category: "cleaning",
        custom_category: "",
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
      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="daily-sales">Daily Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold">Gift Store Management</h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Gift Store Item</DialogTitle>
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
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="kids_toys">Kids Toys</SelectItem>
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.category === "custom" && (
                    <div>
                      <Label htmlFor="custom_category">Custom Category</Label>
                      <Input
                        id="custom_category"
                        value={formData.custom_category}
                        onChange={(e) => setFormData({ ...formData, custom_category: e.target.value })}
                        required
                      />
                    </div>
                  )}
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
                      <Label htmlFor="selling_price">Selling Price (UGX)</Label>
                      <Input
                        id="selling_price"
                        type="number"
                        step="0.01"
                        value={formData.selling_price}
                        onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
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
                  </div>
                  <Button type="submit" className="w-full">Add Item</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gift Store Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
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
                        <TableCell className="capitalize">
                          {item.category === "custom" ? item.custom_category : item.category.replace("_", " ")}
                        </TableCell>
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
                        No gift store items found. Add your first item above.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily-sales">
          <GiftsDailySales />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GiftStoreModule;