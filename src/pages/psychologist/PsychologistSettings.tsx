import { PsychologistLayout } from "@/components/psychologist/PsychologistLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useMyPsychologistProfile, useUpdatePsychologistProfile } from "@/hooks/usePsychologists";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

const SPECIALIZATIONS = [
  "Anxiety",
  "Depression",
  "Relationships",
  "Trauma",
  "Stress Management",
  "Self-Esteem",
  "Grief",
  "Addiction",
  "Family Issues",
  "Career Counseling",
];

const PsychologistSettings = () => {
  const { data: profile, isLoading } = useMyPsychologistProfile();
  const updateProfile = useUpdatePsychologistProfile();

  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "");
      setHourlyRate(profile.hourly_rate?.toString() || "");
      setYearsExperience(profile.years_experience?.toString() || "");
      setSelectedSpecializations(profile.specializations || []);
    }
  }, [profile]);

  const toggleSpecialization = (spec: string) => {
    setSelectedSpecializations((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        bio,
        hourly_rate: parseFloat(hourlyRate) || 0,
        years_experience: parseInt(yearsExperience) || 0,
        specializations: selectedSpecializations,
      });

      toast({
        title: "Settings saved",
        description: "Your profile has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <PsychologistLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PsychologistLayout>
    );
  }

  return (
    <PsychologistLayout>
      <div className="p-6 space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">
              Update your professional profile
            </p>
          </div>
          <Button onClick={handleSave} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            {profile?.is_verified ? (
              <Badge className="bg-green-100 text-green-800">Verified</Badge>
            ) : (
              <div className="space-y-2">
                <Badge className="bg-yellow-100 text-yellow-800">Pending Verification</Badge>
                <p className="text-sm text-muted-foreground">
                  Your profile is under review. You'll be notified once verified.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
            <CardDescription>
              This information will be visible to clients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="license">License Number</Label>
              <Input
                id="license"
                value={profile?.license_number || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Contact support to update license information
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate">Hourly Rate ($)</Label>
                <Input
                  id="rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Specializations</Label>
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATIONS.map((spec) => (
                  <Button
                    key={spec}
                    type="button"
                    variant={selectedSpecializations.includes(spec) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSpecialization(spec)}
                  >
                    {spec}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell clients about your approach and experience..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={6}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </PsychologistLayout>
  );
};

export default PsychologistSettings;
