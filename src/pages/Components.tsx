import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"
import { 
  Play, 
  Settings, 
  Tag, 
  Type, 
  ToggleLeft, 
  Sliders, 
  Palette,
  Code2,
  Sparkles,
  Copy,
  ExternalLink,
  Heart
} from "lucide-react"

export default function Components() {
  const [sliderValue, setSliderValue] = useState([50])
  const [switchChecked, setSwitchChecked] = useState(false)
  const [checkboxChecked, setCheckboxChecked] = useState(false)
  const [likeCount, setLikeCount] = useState(42)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Badge className="bg-gradient-to-r from-primary/10 to-purple-600/10 text-primary border-primary/20 px-4 py-2">
              <Palette className="h-4 w-4 mr-2" />
              shadcn/ui Components
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent">
            UI Components
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore our beautiful collection of components built with shadcn/ui and enhanced with modern styling
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Buttons */}
          <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br from-background to-accent/5">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Play className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Buttons</CardTitle>
                  <CardDescription>Interactive button variants and sizes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Button Variants</Label>
                <div className="flex flex-wrap gap-3">
                  <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all">
                    Default
                  </Button>
                  <Button variant="secondary" className="hover:scale-105 transition-transform">
                    Secondary
                  </Button>
                  <Button variant="outline" className="hover:bg-accent/50 hover:scale-105 transition-all">
                    Outline
                  </Button>
                  <Button variant="ghost" className="hover:bg-accent/50 hover:scale-105 transition-all">
                    Ghost
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-3 block">Button Sizes</Label>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button size="sm" className="hover:scale-105 transition-transform">Small</Button>
                  <Button size="default" className="hover:scale-105 transition-transform">Default</Button>
                  <Button size="lg" className="hover:scale-105 transition-transform">Large</Button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-3 block">Interactive Button</Label>
                <Button 
                  onClick={() => setLikeCount(prev => prev + 1)}
                  className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 transition-all hover:scale-105"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {likeCount} Likes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br from-background to-accent/5">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Tag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Badges</CardTitle>
                  <CardDescription>Labels and status indicators</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Badge Variants</Label>
                <div className="flex flex-wrap gap-3">
                  <Badge className="px-3 py-1">Default</Badge>
                  <Badge variant="secondary" className="px-3 py-1">Secondary</Badge>
                  <Badge variant="outline" className="px-3 py-1">Outline</Badge>
                  <Badge variant="destructive" className="px-3 py-1">Destructive</Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-3 block">Themed Badges</Label>
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Success
                  </Badge>
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1">
                    <Code2 className="h-3 w-3 mr-1" />
                    Tech
                  </Badge>
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1">
                    Hot
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Elements */}
          <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br from-background to-accent/5">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Type className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Form Elements</CardTitle>
                  <CardDescription>Input fields and form controls</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input 
                  type="email" 
                  id="email" 
                  placeholder="Enter your email" 
                  className="focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/20 transition-colors">
                <Checkbox 
                  id="terms" 
                  checked={checkboxChecked}
                  onCheckedChange={setCheckboxChecked}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-primary/80"
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  Accept terms and conditions
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/20 transition-colors">
                <Switch 
                  id="notifications" 
                  checked={switchChecked}
                  onCheckedChange={setSwitchChecked}
                />
                <Label htmlFor="notifications" className="text-sm cursor-pointer">
                  Enable notifications {switchChecked && "✓"}
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Slider */}
          <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br from-background to-accent/5">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Sliders className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Slider</CardTitle>
                  <CardDescription>Range input control</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Volume</Label>
                  <Badge variant="outline" className="px-2 py-1 text-sm">
                    {sliderValue[0]}%
                  </Badge>
                </div>
                <Slider
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground text-center">
                  Drag the slider to adjust the value
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Demo */}
          <Card className="lg:col-span-2 group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br from-background to-accent/5">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Interactive Component Demo</CardTitle>
                  <CardDescription>Try out the components in real-time</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">Settings Panel</h4>
                  <div className="space-y-4 p-4 rounded-lg border bg-accent/10">
                    <div className="flex items-center justify-between">
                      <Label>Dark Mode</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Auto-save</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label>Notification Volume</Label>
                      <Slider defaultValue={[30]} max={100} step={10} />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">Actions</h4>
                  <div className="space-y-3">
                    <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start hover:bg-accent/50">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Export Configuration
                    </Button>
                    <Button variant="secondary" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Advanced Settings
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}