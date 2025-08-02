// src/app/(main)/memory/page.tsx
"use client";

import { useState } from "react";
import { useAppStore, type UserFact } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Edit, Save, X, Info } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";

function FactCard({ fact, onUpdate, onDelete }: { fact: UserFact, onUpdate: (id: string, newFact: string) => void, onDelete: (id: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFact, setEditedFact] = useState(fact.fact);
  const { dict } = useLanguage();

  const handleSave = () => {
    if (editedFact.trim()) {
      onUpdate(fact.id, editedFact.trim());
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
      className="bg-card/80 p-4 rounded-lg border border-primary/20 shadow-sm flex items-center justify-between gap-4"
    >
      {isEditing ? (
        <Input
          value={editedFact}
          onChange={(e) => setEditedFact(e.target.value)}
          className="flex-grow bg-background/80"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
      ) : (
        <p className="flex-grow text-sm font-body text-card-foreground">{fact.fact}</p>
      )}
      <div className="flex gap-2">
        {isEditing ? (
          <>
            <Button variant="ghost" size="icon" onClick={handleSave} aria-label={dict.memory.saveAriaLabel}>
              <Save className="h-4 w-4 text-primary" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} aria-label={dict.memory.cancelAriaLabel}>
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} aria-label={dict.memory.editAriaLabel}>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={dict.memory.deleteAriaLabel}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{dict.memory.deleteConfirmTitle}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {dict.memory.deleteConfirmDesc}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{dict.common.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(fact.id)} className="bg-destructive hover:bg-destructive/90">
                    {dict.common.delete}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function MemoryPage() {
  const { userFacts, updateFact, deleteFact } = useAppStore();
  const { dict } = useLanguage();

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-card/80 border-primary/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-headline">{dict.memory.title}</CardTitle>
          <CardDescription className="font-body">{dict.memory.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(userFacts || []).length === 0 ? (
            <Alert>
                <Info className="h-4 w-4" />
              <AlertTitle>{dict.memory.noFactsTitle}</AlertTitle>
              <AlertDescription>
                {dict.memory.noFactsDesc}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
                <AnimatePresence>
                    {(userFacts || []).map((fact) => (
                        <FactCard key={fact.id} fact={fact} onUpdate={updateFact!} onDelete={deleteFact!} />
                    ))}
                </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
