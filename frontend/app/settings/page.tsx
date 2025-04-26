"use client";

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, CreditCard, Globe, Lock, Mail, Moon, Sun } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") ?? "profile"

      
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
      }
    }

    checkAuth()
  }, [router])
  return (
    <div className="flex-1 w-full mx-auto">
      <AppShell>
        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-display">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          <Tabs defaultValue={activeTab} className="space-y-6">
            <TabsList className="inline-flex justify-start items-center px-1 py-5 bg-card border border-border rounded-full shadow-sm w-full max-w-2xl mb-6">
              <TabsTrigger
                value="profile"
                className="px-6 py-4 text-md font-medium rounded-full transition-all
                  text-muted-foreground hover:text-foreground
                  data-[state=active]:text-white
                  data-[state=active]:bg-primary/60
                  data-[state=active]:shadow
                  data-[state=active]:glow-text"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="px-6 py-4 text-md font-medium rounded-full transition-all
                  text-muted-foreground hover:text-foreground
                  data-[state=active]:text-white
                  data-[state=active]:bg-primary/60
                  data-[state=active]:shadow
                  data-[state=active]:glow-text"
              >
                Appearance
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="px-6 py-4 text-md font-medium rounded-full transition-all
                  text-muted-foreground hover:text-foreground
                  data-[state=active]:text-white
                  data-[state=active]:bg-primary/60
                  data-[state=active]:shadow
                  data-[state=active]:glow-text"
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                className="px-6 py-4 text-md font-medium rounded-full transition-all
                  text-muted-foreground hover:text-foreground
                  data-[state=active]:text-white
                  data-[state=active]:bg-primary/60
                  data-[state=active]:shadow
                  data-[state=active]:glow-text"
              >
                Billing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6 animate-in fade-in-50 duration-300">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="John" className="input-glow" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Doe" className="input-glow" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="john.doe@example.com" className="input-glow" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 input-glow resize-none"
                      placeholder="Tell us about yourself"
                      defaultValue="Learning enthusiast passionate about technology and education."
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button className="glow-button">Save Changes</Button>
                </CardFooter>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>Manage your password and security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" className="input-glow" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" className="input-glow" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" className="input-glow" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Two-factor authentication</span>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Email notifications for login attempts</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button className="glow-button">Update Security Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6 animate-in fade-in-50 duration-300">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize how the platform looks and feels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <RadioGroup defaultValue="dark" className="grid grid-cols-3 gap-4">
                      <Label
                        htmlFor="theme-dark"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                        <Moon className="h-6 w-6 mb-2" />
                        <span>Dark</span>
                      </Label>
                      <Label
                        htmlFor="theme-light"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                        <Sun className="h-6 w-6 mb-2" />
                        <span>Light</span>
                      </Label>
                      <Label
                        htmlFor="theme-system"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                        <Globe className="h-6 w-6 mb-2" />
                        <span>System</span>
                      </Label>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Accent Color</Label>
                    <RadioGroup defaultValue="purple" className="grid grid-cols-4 gap-4">
                      <Label
                        htmlFor="color-purple"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <RadioGroupItem value="purple" id="color-purple" className="sr-only" />
                        <div className="h-6 w-6 rounded-full bg-primary mb-2" />
                        <span>Purple</span>
                      </Label>
                      <Label
                        htmlFor="color-blue"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <RadioGroupItem value="blue" id="color-blue" className="sr-only" />
                        <div className="h-6 w-6 rounded-full bg-blue-500 mb-2" />
                        <span>Blue</span>
                      </Label>
                      <Label
                        htmlFor="color-green"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <RadioGroupItem value="green" id="color-green" className="sr-only" />
                        <div className="h-6 w-6 rounded-full bg-green-500 mb-2" />
                        <span>Green</span>
                      </Label>
                      <Label
                        htmlFor="color-orange"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <RadioGroupItem value="orange" id="color-orange" className="sr-only" />
                        <div className="h-6 w-6 rounded-full bg-orange-500 mb-2" />
                        <span>Orange</span>
                      </Label>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Enable animations</span>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Show progress indicators</span>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Compact view</span>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button className="glow-button">Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 animate-in fade-in-50 duration-300">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Control how and when you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Email Notifications</h3>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Course updates and new content</span>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Learning reminders</span>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Achievement notifications</span>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Marketing and promotional emails</span>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">In-App Notifications</h3>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Course completion reminders</span>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">New feature announcements</span>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Learning suggestions</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="notification-frequency">Notification Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger id="notification-frequency" className="input-glow">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="daily">Daily digest</SelectItem>
                        <SelectItem value="weekly">Weekly digest</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button className="glow-button">Save Notification Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6 animate-in fade-in-50 duration-300">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Subscription Plan</CardTitle>
                  <CardDescription>Manage your subscription and billing information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border border-border/50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Pro Plan</h3>
                        <p className="text-sm text-muted-foreground">$12.00 per month</p>
                      </div>
                      <div className="bg-primary/20 text-primary text-xs font-medium px-2.5 py-1 rounded">Active</div>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckIcon className="h-4 w-4 text-primary" />
                        <span className="text-sm">Unlimited courses</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckIcon className="h-4 w-4 text-primary" />
                        <span className="text-sm">Unlimited Quick Learn</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckIcon className="h-4 w-4 text-primary" />
                        <span className="text-sm">Advanced flashcards</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckIcon className="h-4 w-4 text-primary" />
                        <span className="text-sm">Priority support</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm">
                        Change Plan
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        Cancel Subscription
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Payment Method</h3>
                    <div className="rounded-lg border border-border/50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span>•••• •••• •••• 4242</span>
                          <span className="text-xs text-muted-foreground">Expires 12/24</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Billing History</h3>
                    <div className="rounded-lg border border-border/50 divide-y divide-border/50">
                      {[
                        { date: "Apr 15, 2023", amount: "$12.00", status: "Paid" },
                        { date: "Mar 15, 2023", amount: "$12.00", status: "Paid" },
                        { date: "Feb 15, 2023", amount: "$12.00", status: "Paid" },
                      ].map((invoice, index) => (
                        <div key={index} className="flex items-center justify-between p-4">
                          <div>
                            <p className="text-sm font-medium">Invoice #{index + 1}</p>
                            <p className="text-xs text-muted-foreground">{invoice.date}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm">{invoice.amount}</span>
                            <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">
                              {invoice.status}
                            </span>
                            <Button variant="ghost" size="sm">
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppShell>
    </div>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
