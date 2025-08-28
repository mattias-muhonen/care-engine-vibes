import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Code, Zap, Shield, Palette, Check, Github, ExternalLink, Sparkles, Rocket, Globe } from "lucide-react"

const techStack = [
  {
    name: "React 19",
    description: "Latest React with improved performance",
    icon: Code,
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950"
  },
  {
    name: "TypeScript",
    description: "Type-safe JavaScript development",
    icon: Shield,
    color: "from-blue-600 to-blue-800",
    bgColor: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
  },
  {
    name: "Vite",
    description: "Lightning fast build tool",
    icon: Zap,
    color: "from-yellow-500 to-orange-500",
    bgColor: "from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950"
  },
  {
    name: "shadcn/ui",
    description: "Beautiful, accessible components",
    icon: Palette,
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950"
  }
]

const features = [
  "Single Page Application architecture for smooth navigation",
  "Modern component library with shadcn/ui",
  "Responsive design that works on all devices",
  "Type-safe development with TypeScript",
  "Fast development and build processes with Vite",
  "Beautiful gradients and animations",
  "Accessible components following WCAG guidelines",
  "Optimized for performance and SEO"
]

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Badge className="bg-gradient-to-r from-primary/10 to-purple-600/10 text-primary border-primary/20 px-4 py-2">
              <Rocket className="h-4 w-4 mr-2" />
              Modern Web Application
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent">
            About This Application
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Built with cutting-edge web technologies to showcase modern development practices and deliver exceptional user experiences
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Technology Stack */}
          <Card className="border-2 hover:border-primary/20 transition-colors bg-gradient-to-br from-background to-accent/5">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-2xl flex items-center justify-center">
                  <Code className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl md:text-3xl">Technology Stack</CardTitle>
              <CardDescription className="text-lg">The powerful technologies driving this application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {techStack.map((tech) => {
                  const Icon = tech.icon
                  return (
                    <div key={tech.name} className="group text-center p-6 rounded-xl border-2 hover:border-primary/20 transition-all hover:-translate-y-1 bg-gradient-to-br from-background to-accent/10">
                      <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${tech.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <Badge className={`mb-3 bg-gradient-to-r ${tech.bgColor} border-0 text-foreground px-3 py-1`}>
                        {tech.name}
                      </Badge>
                      <p className="text-sm text-muted-foreground">{tech.description}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="border-2 hover:border-primary/20 transition-colors bg-gradient-to-br from-background to-accent/5">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl md:text-3xl">Key Features</CardTitle>
              <CardDescription className="text-lg">What makes this application exceptional</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg border hover:bg-accent/20 transition-colors">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="border-2 hover:border-primary/20 transition-colors bg-gradient-to-br from-background to-accent/5 text-center">
            <CardContent className="py-12">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <Globe className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Ready to Explore?
              </h3>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Dive into the components showcase to see these technologies in action, or start building your own amazing applications.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all">
                  <Github className="h-4 w-4 mr-2" />
                  View Source Code
                </Button>
                <Button size="lg" variant="outline" className="border-2 hover:bg-accent/50 transition-all">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Live Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}