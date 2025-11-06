'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Settings, Shield, Bell, BarChart3, Save } from 'lucide-react';

interface Setting {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: 'general' | 'security' | 'notifications' | 'analytics';
  description?: string;
}

interface SettingsGroup {
  general: Setting[];
  security: Setting[];
  notifications: Setting[];
  analytics: Setting[];
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsGroup>({
    general: [],
    security: [],
    notifications: [],
    analytics: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedSettings, setEditedSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings?grouped=true');
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);

        // Initialize edited settings with current values
        const initialValues: Record<string, any> = {};
        (Object.values(data.settings).flat() as Setting[]).forEach((setting) => {
          initialValues[setting.key] = setting.value;
        });
        setEditedSettings(initialValues);
      } else {
        toast.error('Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setEditedSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Build settings array from edited values
      const settingsToUpdate: Setting[] = [];

      Object.entries(editedSettings).forEach(([key, value]) => {
        // Find the original setting to get type and category
        let originalSetting: Setting | undefined;
        for (const category of Object.keys(settings) as Array<keyof SettingsGroup>) {
          originalSetting = settings[category].find(s => s.key === key);
          if (originalSetting) break;
        }

        if (originalSetting) {
          settingsToUpdate.push({
            key,
            value,
            type: originalSetting.type,
            category: originalSetting.category,
            description: originalSetting.description,
          });
        }
      });

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: settingsToUpdate }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Settings saved successfully');
        fetchSettings(); // Refresh settings
      } else {
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const renderSettingInput = (setting: Setting) => {
    const value = editedSettings[setting.key] ?? setting.value;

    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={setting.key}
              checked={value === true}
              onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor={setting.key} className="cursor-pointer">
              {setting.description || setting.key}
            </Label>
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>
              {setting.description || setting.key}
            </Label>
            <Input
              type="number"
              id={setting.key}
              value={value}
              onChange={(e) => handleSettingChange(setting.key, parseFloat(e.target.value) || 0)}
            />
          </div>
        );

      case 'json':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>
              {setting.description || setting.key}
            </Label>
            <textarea
              id={setting.key}
              value={JSON.stringify(value, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleSettingChange(setting.key, parsed);
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              className="w-full min-h-[100px] p-2 border rounded-md font-mono text-sm"
            />
          </div>
        );

      case 'string':
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>
              {setting.description || setting.key}
            </Label>
            <Input
              type="text"
              id={setting.key}
              value={value}
              onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage system configuration and preferences
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic application configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.general.map(setting => (
                <div key={setting.key}>
                  {renderSettingInput(setting)}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Authentication and access control configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.security.map(setting => (
                <div key={setting.key}>
                  {renderSettingInput(setting)}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Email and webhook notification configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.notifications.map(setting => (
                <div key={setting.key}>
                  {renderSettingInput(setting)}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Settings</CardTitle>
              <CardDescription>
                Data retention and export configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.analytics.map(setting => (
                <div key={setting.key}>
                  {renderSettingInput(setting)}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
