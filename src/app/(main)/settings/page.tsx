// src/app/(main)/settings/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAppStore, type OraclePersonality } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Eraser, AlertTriangle, Languages, SmilePlus, Save, Bot } from "lucide-react";
import { ContactForm } from '@/components/contact-form';
import { useLanguage } from "@/hooks/use-language";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';

function PersonalizationCard() {
    const { userName, userGender, setUserName, setUserGender } = useAppStore();
    const { toast } = useToast();
    const { dict } = useLanguage();

    const handleSave = () => {
        // The values are already updated in the store on change,
        // so this is just for user feedback.
        toast({
            title: dict.common.updated,
            description: dict.settings.personalization.savedDesc,
        });
    };

    return (
        <Card className="bg-card/80 border-primary/20 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <SmilePlus className="h-6 w-6 text-primary" />
                    {dict.settings.personalization.title}
                </CardTitle>
                <CardDescription className="font-body">{dict.settings.personalization.desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="user-name">{dict.settings.personalization.nameLabel}</Label>
                    <Input 
                        id="user-name" 
                        placeholder={dict.settings.personalization.namePlaceholder}
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>{dict.settings.personalization.genderLabel}</Label>
                    <RadioGroup 
                        value={userGender} 
                        onValueChange={(value) => setUserGender(value as 'male' | 'female' | 'non-binary')} 
                        className="flex items-center space-x-4 pt-2"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="g-male" />
                            <Label htmlFor="g-male">{dict.settings.personalization.genderMale}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="g-female" />
                            <Label htmlFor="g-female">{dict.settings.personalization.genderFemale}</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <RadioGroupItem value="non-binary" id="g-non-binary" />
                            <Label htmlFor="g-non-binary">{dict.settings.personalization.genderNonBinary}</Label>
                        </div>
                    </RadioGroup>
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    {dict.common.save}
                </Button>
            </CardFooter>
        </Card>
    );
}

function OraclePersonalityCard() {
    const { oraclePersonality, setOraclePersonality } = useAppStore();
    const { dict } = useLanguage();
    const { toast } = useToast();

    const handlePersonalityChange = (value: string) => {
        setOraclePersonality(value as OraclePersonality);
        toast({
            title: dict.common.updated,
            description: dict.settings.personality.savedDesc,
        });
    };

    return (
        <Card className="bg-card/80 border-primary/20 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Bot className="h-6 w-6 text-primary" />
                    {dict.settings.personality.title}
                </CardTitle>
                <CardDescription className="font-body">{dict.settings.personality.desc}</CardDescription>
            </CardHeader>
            <CardContent>
                <Select value={oraclePersonality} onValueChange={handlePersonalityChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={dict.settings.personality.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="wise">{dict.settings.personality.wise}</SelectItem>
                        <SelectItem value="direct">{dict.settings.personality.direct}</SelectItem>
                        <SelectItem value="poetic">{dict.settings.personality.poetic}</SelectItem>
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
    );
}

function LanguageCard() {
    const { language, setLanguage, dict } = useLanguage();

    const handleLanguageChange = (checked: boolean) => {
        setLanguage(checked ? 'en' : 'es');
    };

    return (
        <Card className="bg-card/80 border-primary/20 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Languages className="h-6 w-6 text-primary" />
                    {dict.settings.language.title}
                </CardTitle>
                <CardDescription className="font-body">{dict.settings.language.desc}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center space-x-2 rounded-lg border border-border p-4">
                    <Label htmlFor="language-switch" className={language === 'es' ? 'text-foreground font-semibold' : 'text-muted-foreground'}>Español</Label>
                    <Switch
                        id="language-switch"
                        checked={language === 'en'}
                        onCheckedChange={handleLanguageChange}
                        aria-label="Language Switch"
                    />
                    <Label htmlFor="language-switch" className={language === 'en' ? 'text-foreground font-semibold' : 'text-muted-foreground'}>English</Label>
                </div>
            </CardContent>
        </Card>
    );
}

export default function SettingsPage() {
  const { clearAllData } = useAppStore();
  const { toast } = useToast();
  const { dict } = useLanguage();

  const handleClearData = () => {
    clearAllData(dict.store.clearedMessage);
    toast({
      title: dict.settings.clearData.successTitle,
      description: dict.settings.clearData.successDesc,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PersonalizationCard />
      <OraclePersonalityCard />
      <LanguageCard />
      <ContactForm />
      <Card className="border-destructive/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle className="font-headline">{dict.settings.dangerZone.title}</CardTitle>
          </div>
          <CardDescription className="font-body">
            {dict.settings.dangerZone.desc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-4">
            <div>
              <h3 className="font-semibold">{dict.settings.clearData.title}</h3>
              <p className="text-sm text-muted-foreground">
                {dict.settings.clearData.desc}
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Eraser className="mr-2 h-4 w-4" />
                  {dict.settings.clearData.button}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{dict.settings.clearData.confirmTitle}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {dict.settings.clearData.confirmDesc}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{dict.common.cancel}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleClearData}
                  >
                    {dict.settings.clearData.confirmButton}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
