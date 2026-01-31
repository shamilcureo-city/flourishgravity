import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Search, Video, MessageCircle, Clock } from "lucide-react";
import { usePsychologists } from "@/hooks/usePsychologists";

const SPECIALIZATION_OPTIONS = [
  "All",
  "Anxiety",
  "Depression",
  "Relationships",
  "Trauma",
  "Stress Management",
  "Self-Esteem",
  "Grief",
  "Addiction",
];

const FindPsychologists = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All");

  const { data: psychologists = [], isLoading } = usePsychologists(
    selectedSpecialization !== "All" ? { specialization: selectedSpecialization } : undefined
  );

  const filteredPsychologists = psychologists.filter((psych) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      psych.bio?.toLowerCase().includes(query) ||
      psych.specializations.some((s) => s.toLowerCase().includes(query))
    );
  });

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Find a Psychologist</h1>
          <p className="text-muted-foreground">
            Browse verified professionals and book a consultation
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, specialty, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATION_OPTIONS.map((spec) => (
              <Button
                key={spec}
                variant={selectedSpecialization === spec ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSpecialization(spec)}
              >
                {spec}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredPsychologists.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-center">
                No psychologists found matching your criteria.
                <br />
                Try adjusting your filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPsychologists.map((psych) => (
              <Card key={psych.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={psych.profile_photo_url || undefined} />
                      <AvatarFallback className="text-lg">
                        {psych.bio?.charAt(0) || "P"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        Licensed Psychologist
                      </CardTitle>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {psych.rating_avg ? psych.rating_avg.toFixed(1) : "New"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({psych.total_reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {psych.bio || "No bio available"}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {psych.specializations.slice(0, 3).map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                    {psych.specializations.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{psych.specializations.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{psych.years_experience} years exp.</span>
                    </div>
                    <div className="font-semibold text-primary">
                      ${psych.hourly_rate}/hr
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/consultations/book/${psych.id}?type=chat`)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/consultations/book/${psych.id}?type=video`)}
                    >
                      <Video className="h-4 w-4 mr-1" />
                      Video
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default FindPsychologists;
