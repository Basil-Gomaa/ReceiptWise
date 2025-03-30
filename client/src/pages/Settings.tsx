import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Settings as SettingsIcon, 
  Shield, 
  Database, 
  Bell, 
  Share2,
  Lock 
} from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [activeTab, setActiveTab] = useState("account");
  
  const handleSaveApiKey = () => {
    // In a real app, this would persist the API key to env vars
    // For demo purposes, we just show a success message
    toast({
      title: "API Key Saved",
      description: "Your Google Vision API key has been saved successfully.",
    });
  };

  return (
    <div className="settings-tab">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="md:col-span-1">
          <Card>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium">Settings</h3>
            </div>
            
            <nav className="p-2">
              <a 
                href="#account" 
                onClick={(e) => { e.preventDefault(); setActiveTab("account"); }}
                className={`flex items-center px-4 py-3 rounded-lg ${
                  activeTab === "account" 
                    ? "text-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <User className="h-5 w-5 mr-3" />
                Account
              </a>
              
              <a 
                href="#preferences" 
                onClick={(e) => { e.preventDefault(); setActiveTab("preferences"); }}
                className={`flex items-center px-4 py-3 rounded-lg mt-1 ${
                  activeTab === "preferences" 
                    ? "text-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <SettingsIcon className="h-5 w-5 mr-3" />
                Preferences
              </a>
              
              <a 
                href="#data" 
                onClick={(e) => { e.preventDefault(); setActiveTab("data"); }}
                className={`flex items-center px-4 py-3 rounded-lg mt-1 ${
                  activeTab === "data" 
                    ? "text-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Database className="h-5 w-5 mr-3" />
                Data Management
              </a>
              
              <a 
                href="#notifications" 
                onClick={(e) => { e.preventDefault(); setActiveTab("notifications"); }}
                className={`flex items-center px-4 py-3 rounded-lg mt-1 ${
                  activeTab === "notifications" 
                    ? "text-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Bell className="h-5 w-5 mr-3" />
                Notifications
              </a>
              
              <a 
                href="#integrations" 
                onClick={(e) => { e.preventDefault(); setActiveTab("integrations"); }}
                className={`flex items-center px-4 py-3 rounded-lg mt-1 ${
                  activeTab === "integrations" 
                    ? "text-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Share2 className="h-5 w-5 mr-3" />
                Integrations
              </a>
              
              <a 
                href="#security" 
                onClick={(e) => { e.preventDefault(); setActiveTab("security"); }}
                className={`flex items-center px-4 py-3 rounded-lg mt-1 ${
                  activeTab === "security" 
                    ? "text-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Shield className="h-5 w-5 mr-3" />
                Security
              </a>
            </nav>
          </Card>
        </div>
        
        {/* Settings Content */}
        <div className="md:col-span-3">
          {/* Account Settings Section */}
          <Card className={`mb-6 ${activeTab !== "account" && "hidden"}`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium">Account Settings</h3>
            </div>
            
            <CardContent className="p-6">
              {/* Profile Information */}
              <div className="mb-8">
                <h4 className="text-md font-medium mb-4">Profile Information</h4>
                
                <div className="flex items-center mb-6">
                  <div className="mr-6">
                    <div className="h-20 w-20 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-500">
                      <User className="h-10 w-10" />
                    </div>
                  </div>
                  
                  <div>
                    <Button>
                      Change Avatar
                    </Button>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">JPG, GIF or PNG. Max size 1MB.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName" className="mb-1">Full Name</Label>
                    <Input id="fullName" defaultValue="Jane Doe" />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="mb-1">Email Address</Label>
                    <Input id="email" type="email" defaultValue="jane.doe@example.com" />
                  </div>
                </div>
              </div>
              
              {/* API Key Section */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-4">Google Vision API Key</h4>
                
                <div className="flex items-center mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Connect your Google Vision API key to enable OCR functionality for receipt scanning.</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Input 
                    placeholder="Enter Google Vision API Key" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    type="password"
                  />
                  
                  <Button onClick={handleSaveApiKey}>
                    Save Key
                  </Button>
                </div>
              </div>
              
              {/* Subscription Plan */}
              <div>
                <h4 className="text-md font-medium mb-4">Subscription Plan</h4>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Free Plan</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Limited to 20 receipts per month</p>
                    </div>
                    
                    <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs font-semibold rounded-full">
                      Active
                    </span>
                  </div>
                </div>
                
                <Button>
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Preferences Section */}
          <Card className={`mb-6 ${activeTab !== "preferences" && "hidden"}`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium">Preferences</h3>
            </div>
            
            <CardContent className="p-6">
              <p className="text-gray-500 dark:text-gray-400">
                This section allows you to customize your application preferences.
              </p>
            </CardContent>
          </Card>
          
          {/* Data Management Section */}
          <Card className={`mb-6 ${activeTab !== "data" && "hidden"}`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium">Data Management</h3>
            </div>
            
            <CardContent className="p-6">
              <p className="text-gray-500 dark:text-gray-400">
                Manage your data and export options.
              </p>
            </CardContent>
          </Card>
          
          {/* Notifications Section */}
          <Card className={`mb-6 ${activeTab !== "notifications" && "hidden"}`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium">Notifications</h3>
            </div>
            
            <CardContent className="p-6">
              <p className="text-gray-500 dark:text-gray-400">
                Configure your notification preferences.
              </p>
            </CardContent>
          </Card>
          
          {/* Integrations Section */}
          <Card className={`mb-6 ${activeTab !== "integrations" && "hidden"}`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium">Integrations</h3>
            </div>
            
            <CardContent className="p-6">
              <p className="text-gray-500 dark:text-gray-400">
                Connect with other services and applications.
              </p>
            </CardContent>
          </Card>
          
          {/* Security Section */}
          <Card className={`mb-6 ${activeTab !== "security" && "hidden"}`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium">Security</h3>
            </div>
            
            <CardContent className="p-6">
              <p className="text-gray-500 dark:text-gray-400">
                Manage your account security settings.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
