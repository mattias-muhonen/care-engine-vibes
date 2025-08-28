import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Target, 
  Clock, 
  Shield, 
  Bell,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Users,
  MessageSquare
} from "lucide-react"
import { mockSystemSettings } from "@/lib/mockData"
import { dutch } from "@/lib/dutch"
import type { SystemSettings } from "@/types/audit"

export default function Configuration() {
  const [settings, setSettings] = useState<SystemSettings>(mockSystemSettings)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const updateSetting = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setIsDirty(true)
  }

  const updateThreshold = (key: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      hba1cThresholds: {
        ...prev.hba1cThresholds,
        [key]: value
      }
    }))
    setIsDirty(true)
  }

  const updateOverdueThreshold = (key: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      overdueThresholds: {
        ...prev.overdueThresholds,
        [key]: value
      }
    }))
    setIsDirty(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setIsDirty(false)
  }

  const handleReset = () => {
    setSettings(mockSystemSettings)
    setIsDirty(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{dutch.configuration}</h1>
            <p className="text-muted-foreground">
              Configureer NHG-drempelwaarden, automatiseringsregels en systeeminstellingen
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleReset} disabled={!isDirty}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!isDirty || isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Opslaan...' : 'Instellingen opslaan'}
            </Button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Praktijk Status</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Actief</div>
              <p className="text-xs text-muted-foreground">{settings.practiceName}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Noodstop</CardTitle>
              <Shield className={`h-4 w-4 ${settings.emergencyStopEnabled ? 'text-red-500' : 'text-green-500'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${settings.emergencyStopEnabled ? 'text-red-600' : 'text-green-600'}`}>
                {settings.emergencyStopEnabled ? 'Ingeschakeld' : 'Uitgeschakeld'}
              </div>
              <p className="text-xs text-muted-foreground">Automatisering status</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dagelijkse Limiet</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{settings.dailyActionLimit}</div>
              <p className="text-xs text-muted-foreground">Acties per dag</p>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Tabs */}
        <Tabs defaultValue="thresholds" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="thresholds">NHG Drempels</TabsTrigger>
            <TabsTrigger value="automation">Automatisering</TabsTrigger>
            <TabsTrigger value="notifications">Meldingen</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          {/* NHG Thresholds Tab */}
          <TabsContent value="thresholds" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* HbA1c Thresholds */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>HbA1c Drempelwaarden</span>
                  </CardTitle>
                  <CardDescription>
                    NHG-richtlijnen voor HbA1c waarden (mmol/mol)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Goed (&lt; {settings.hba1cThresholds.good} mmol/mol)</Label>
                    <Slider
                      value={[settings.hba1cThresholds.good]}
                      onValueChange={([value]) => updateThreshold('good', value)}
                      max={60}
                      min={40}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>40</span>
                      <span className="font-medium">{settings.hba1cThresholds.good}</span>
                      <span>60</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Acceptabel (&lt; {settings.hba1cThresholds.acceptable} mmol/mol)</Label>
                    <Slider
                      value={[settings.hba1cThresholds.acceptable]}
                      onValueChange={([value]) => updateThreshold('acceptable', value)}
                      max={70}
                      min={50}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>50</span>
                      <span className="font-medium">{settings.hba1cThresholds.acceptable}</span>
                      <span>70</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Actie nodig (≥ {settings.hba1cThresholds.actionNeeded} mmol/mol)</Label>
                    <Slider
                      value={[settings.hba1cThresholds.actionNeeded]}
                      onValueChange={([value]) => updateThreshold('actionNeeded', value)}
                      max={80}
                      min={60}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>60</span>
                      <span className="font-medium">{settings.hba1cThresholds.actionNeeded}</span>
                      <span>80</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">NHG Richtlijn Conformiteit</span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Deze waarden zijn gebaseerd op de Nederlandse Huisarts Genootschap (NHG) standaarden voor diabetes type 2.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Overdue Thresholds */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Achterstalligheidsdrempels</span>
                  </CardTitle>
                  <CardDescription>
                    Wanneer controles als achterstallig worden beschouwd
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>HbA1c controle ({settings.overdueThresholds.hba1cMonths} maanden)</Label>
                    <Slider
                      value={[settings.overdueThresholds.hba1cMonths]}
                      onValueChange={([value]) => updateOverdueThreshold('hba1cMonths', value)}
                      max={12}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>1 maand</span>
                      <span className="font-medium">{settings.overdueThresholds.hba1cMonths} maanden</span>
                      <span>12 maanden</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Bezoek controle ({settings.overdueThresholds.visitMonths} maanden)</Label>
                    <Slider
                      value={[settings.overdueThresholds.visitMonths]}
                      onValueChange={([value]) => updateOverdueThreshold('visitMonths', value)}
                      max={12}
                      min={3}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>3 maanden</span>
                      <span className="font-medium">{settings.overdueThresholds.visitMonths} maanden</span>
                      <span>12 maanden</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Urgente follow-up ({settings.overdueThresholds.urgentDays} dagen)</Label>
                    <Slider
                      value={[settings.overdueThresholds.urgentDays]}
                      onValueChange={([value]) => updateOverdueThreshold('urgentDays', value)}
                      max={30}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>1 dag</span>
                      <span className="font-medium">{settings.overdueThresholds.urgentDays} dagen</span>
                      <span>30 dagen</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div className="flex items-center space-x-2 text-orange-700 dark:text-orange-300">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Impact Voorvertoning</span>
                    </div>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      Wijzigingen zullen ongeveer 15-20% van de patiënten beïnvloeden bij volgende scan.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Automation Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Automatisering Instellingen</span>
                  </CardTitle>
                  <CardDescription>
                    Beheer automatische goedkeuringen en limieten
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatische goedkeuring</Label>
                      <div className="text-sm text-muted-foreground">
                        Automatisch goedkeuren van lage risico acties
                      </div>
                    </div>
                    <Switch 
                      checked={settings.autoApprovalEnabled}
                      onCheckedChange={(checked) => updateSetting('autoApprovalEnabled', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Dagelijkse actie limiet</Label>
                    <Input
                      type="number"
                      value={settings.dailyActionLimit}
                      onChange={(e) => updateSetting('dailyActionLimit', parseInt(e.target.value) || 0)}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground">
                      Maximaal aantal acties per dag (0 = onbeperkt)
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Maximale bulk actie grootte</Label>
                    <Input
                      type="number"
                      value={settings.maxBulkActionSize}
                      onChange={(e) => updateSetting('maxBulkActionSize', parseInt(e.target.value) || 0)}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground">
                      Maximaal aantal patiënten in één bulk actie
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Alleen kantooruren</Label>
                      <div className="text-sm text-muted-foreground">
                        Acties alleen uitvoeren tijdens kantooruren (9-17u)
                      </div>
                    </div>
                    <Switch 
                      checked={settings.businessHoursOnly}
                      onCheckedChange={(checked) => updateSetting('businessHoursOnly', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekenden ingeschakeld</Label>
                      <div className="text-sm text-muted-foreground">
                        Acties ook uitvoeren in het weekend
                      </div>
                    </div>
                    <Switch 
                      checked={settings.weekendsEnabled}
                      onCheckedChange={(checked) => updateSetting('weekendsEnabled', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Veiligheidscontroles</span>
                  </CardTitle>
                  <CardDescription>
                    Noodstop en veiligheidsmaatregelen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className={`p-4 rounded-lg border-2 ${settings.emergencyStopEnabled ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <Label className={settings.emergencyStopEnabled ? 'text-red-700' : 'text-green-700'}>
                          {settings.emergencyStopEnabled ? 'NOODSTOP ACTIEF' : 'Systeem Normaal'}
                        </Label>
                        <div className="text-sm text-muted-foreground mt-1">
                          {settings.emergencyStopEnabled ? 'Alle automatisering is gestopt' : 'Automatisering werkt normaal'}
                        </div>
                      </div>
                      <Button
                        variant={settings.emergencyStopEnabled ? "destructive" : "outline"}
                        onClick={() => updateSetting('emergencyStopEnabled', !settings.emergencyStopEnabled)}
                      >
                        {settings.emergencyStopEnabled ? 'Deactiveren' : 'Noodstop'}
                      </Button>
                    </div>
                    
                    {settings.emergencyStopEnabled && (
                      <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
                        ⚠️ Alle automatische acties zijn gepauzeerd. Handmatige goedkeuring vereist.
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Noodcontact e-mail</Label>
                      <Input
                        type="email"
                        value={settings.emergencyContactEmail}
                        onChange={(e) => updateSetting('emergencyContactEmail', e.target.value)}
                        placeholder="admin@praktijk.nl"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Meldingsinstellingen</span>
                  </CardTitle>
                  <CardDescription>
                    Configureer e-mail en SMS meldingen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>E-mail meldingen</span>
                      </Label>
                      <div className="text-sm text-muted-foreground">
                        Ontvang e-mail bij belangrijke gebeurtenissen
                      </div>
                    </div>
                    <Switch 
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>SMS meldingen</span>
                      </Label>
                      <div className="text-sm text-muted-foreground">
                        Ontvang SMS bij urgente situaties
                      </div>
                    </div>
                    <Switch 
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Data & Privacy</span>
                  </CardTitle>
                  <CardDescription>
                    AVG/GDPR en data retention instellingen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Data bewaarperiode (dagen)</Label>
                    <Input
                      type="number"
                      value={settings.dataRetentionDays}
                      onChange={(e) => updateSetting('dataRetentionDays', parseInt(e.target.value) || 0)}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground">
                      Hoe lang patiëntgegevens bewaard worden (wettelijk minimum: 7 jaar)
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Audit log bewaarperiode (dagen)</Label>
                    <Input
                      type="number"
                      value={settings.auditLogRetentionDays}
                      onChange={(e) => updateSetting('auditLogRetentionDays', parseInt(e.target.value) || 0)}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground">
                      Hoe lang audit logs bewaard worden voor compliance
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Toestemming herinnering (dagen)</Label>
                    <Input
                      type="number"
                      value={settings.consentReminderDays}
                      onChange={(e) => updateSetting('consentReminderDays', parseInt(e.target.value) || 0)}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground">
                      Hoe vaak patiënten herinnerd worden om toestemming te vernieuwen
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">AVG Compliant</span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Alle instellingen voldoen aan de Nederlandse privacywetgeving.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Warning */}
        {isDirty && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-orange-700 dark:text-orange-300">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Niet-opgeslagen wijzigingen</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleReset}>
                    Annuleren
                  </Button>
                  <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700">
                    Wijzigingen opslaan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}