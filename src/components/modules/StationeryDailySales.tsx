import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Sale {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  selling_price: number;
  total_amount: number;
  profit: number;
  date: string;
  sold_by: string | null;
}

interface StationeryDailySalesProps {
  items: Array<{ id: string; item: string; selling_price: number; stock: number }>;
}

const StationeryDailySales = ({ items }: StationeryDailySalesProps) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saleData, setSaleData] = useState({
    item_id: "",
    quantity: "1",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    const { data, error } = await supabase
      .from("stationery_sales")
      .select("*, stationery:item_id(item)")
      .gte("date", startOfDay)
      .lte("date", endOfDay)
      .order("date", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching sales",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSales(
        data?.map((sale) => ({
          ...sale,
          item_name: sale.stationery?.item || "Unknown Item",
        })) || []
      );
    }
  };

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const item = items.find((i) => i.id === saleData.item_id);
    if (!item) return;

    const quantity = parseInt(saleData.quantity);
    const totalAmount = quantity * item.selling_price;
    const profit = quantity * (item.selling_price - (item.selling_price * 0.8)); // Assuming 20% profit margin

    const { error } = await supabase.from("stationery_sales").insert([
      {
        item_id: saleData.item_id,
        quantity,
        selling_price: item.selling_price,
        total_amount: totalAmount,
        profit,
      },
    ]);

    if (error) {
      toast({
        title: "Error recording sale",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Update stock
      await supabase
        .from("stationery")
        .update({ stock: item.stock - quantity })
        .eq("id", item.id);

      toast({
        title: "Success",
        description: "Sale recorded successfully",
      });
      setIsDialogOpen(false);
      setSaleData({
        item_id: "",
        quantity: "1",
      });
      fetchSales();
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    const { error } = await supabase.from("stationery_sales").delete().eq("id", saleId);

    if (error) {
      toast({
        title: "Error deleting sale",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Sale deleted successfully",
      });
      fetchSales();
    }
  };

  const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold">Today's Sales</h4>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Record Sale
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Sale</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaleSubmit} className="space-y-4">
              <div>
                <Label>Item</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={saleData.item_id}
                  onChange={(e) => setSaleData({ ...saleData, item_id: e.target.value })}
                  required
                >
                  <option value="">Select an item</option>
                  {items
                    .filter((item) => item.stock > 0)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.item} (Stock: {item.stock})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={saleData.quantity}
                  onChange={(e) => setSaleData({ ...saleData, quantity: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Record Sale
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {totalSales.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {totalProfit.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.item_name}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>UGX {sale.selling_price.toLocaleString()}</TableCell>
                    <TableCell>UGX {sale.total_amount.toLocaleString()}</TableCell>
                    <TableCell>{format(new Date(sale.date), "hh:mm a")}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteSale(sale.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No sales recorded today
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

export default StationeryDailySales;
