import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Package, Gift, Scissors, Printer, Palette } from "lucide-react";
import StationeryModule from "./modules/StationeryModule";
import GiftStoreModule from "./modules/GiftStoreModule";
import EmbroideryModule from "./modules/EmbroideryModule";
import MachinesModule from "./modules/MachinesModule";
import ArtServicesModule from "./modules/ArtServicesModule";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const [addTriggers, setAddTriggers] = useState<Record<string, number>>({
    stationery: 0,
    "gift-store": 0,
    embroidery: 0,
    machines: 0,
    "art-services": 0,
  });

  const modules = [
    {
      id: "stationery",
      name: "Stationery",
      icon: Package,
      description: "Manage stationery inventory and sales",
      color: "bg-blue-500",
    },
    {
      id: "gift-store",
      name: "Gift Store",
      icon: Gift,
      description: "Track gift items by category",
      color: "bg-green-500",
    },
    {
      id: "embroidery",
      name: "Embroidery",
      icon: Scissors,
      description: "Embroidery services and quotations",
      color: "bg-purple-500",
    },
    {
      id: "machines",
      name: "Machines",
      icon: Printer,
      description: "Printing and machine services",
      color: "bg-orange-500",
    },
    {
      id: "art-services",
      name: "Art Services",
      icon: Palette,
      description: "Custom art and design services",
      color: "bg-red-500",
    },
  ];

  const moduleIds = ["stationery","gift-store","embroidery","machines","art-services"] as const;
  type ModuleId = typeof moduleIds[number];
  const tableMap: Record<ModuleId, 'stationery' | 'gift_store' | 'embroidery' | 'machines' | 'art_services'> = {
    "stationery": "stationery",
    "gift-store": "gift_store",
    "embroidery": "embroidery",
    "machines": "machines",
    "art-services": "art_services",
  };

  const handleAddEntry = () => {
    if (!moduleIds.includes(activeTab as ModuleId)) {
      toast({ title: "Select a module", description: "Open a module tab first, then click Add Entry." });
      return;
    }
    setAddTriggers(prev => ({ ...prev, [activeTab]: Date.now() }));
  };

  const toCSV = (rows: any[]) => {
    if (!rows || rows.length === 0) return "";
    const headers = Object.keys(rows[0]);
    const escape = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    return [headers.join(","), ...rows.map(r => headers.map(h => escape(r[h])).join(","))].join("\n");
  };

  const handleExportReport = async () => {
    if (!moduleIds.includes(activeTab as ModuleId)) {
      toast({ title: "Select a module", description: "Go to a module tab to export its report." });
      return;
    }
    const table = tableMap[activeTab as ModuleId];
    const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Export failed", description: error.message, variant: "destructive" });
      return;
    }
    const csv = toCSV(data || []);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}-report-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export started", description: "Your CSV report has been downloaded." });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Inventory Dashboard</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportReport}>Export Report</Button>
          <Button onClick={handleAddEntry}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stationery">Stationery</TabsTrigger>
          <TabsTrigger value="gift-store">Gift Store</TabsTrigger>
          <TabsTrigger value="embroidery">Embroidery</TabsTrigger>
          <TabsTrigger value="machines">Machines</TabsTrigger>
          <TabsTrigger value="art-services">Art Services</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Card key={module.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setActiveTab(module.id)}>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className={`p-2 rounded-md ${module.color} text-white mr-3`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.name}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">Total entries</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Daily overview of all departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">$0</div>
                  <div className="text-sm text-muted-foreground">Total Sales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">$0</div>
                  <div className="text-sm text-muted-foreground">Total Profit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">0</div>
                  <div className="text-sm text-muted-foreground">Items Sold</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-muted-foreground">Services Done</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stationery">
          <StationeryModule openAddTrigger={addTriggers["stationery"]} />
        </TabsContent>

        <TabsContent value="gift-store">
          <GiftStoreModule openAddTrigger={addTriggers["gift-store"]} />
        </TabsContent>

        <TabsContent value="embroidery">
          <EmbroideryModule openAddTrigger={addTriggers["embroidery"]} />
        </TabsContent>

        <TabsContent value="machines">
          <MachinesModule openAddTrigger={addTriggers["machines"]} />
        </TabsContent>

        <TabsContent value="art-services">
          <ArtServicesModule openAddTrigger={addTriggers["art-services"]} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;