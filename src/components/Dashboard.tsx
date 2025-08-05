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

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Inventory Dashboard</h2>
        <div className="flex gap-2">
          <Button variant="outline">Export Report</Button>
          <Button>
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
          <StationeryModule />
        </TabsContent>

        <TabsContent value="gift-store">
          <GiftStoreModule />
        </TabsContent>

        <TabsContent value="embroidery">
          <EmbroideryModule />
        </TabsContent>

        <TabsContent value="machines">
          <MachinesModule />
        </TabsContent>

        <TabsContent value="art-services">
          <ArtServicesModule />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;