import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

export const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [generalSubmissions, setGeneralSubmissions] = useState<any[]>([]);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate("/");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (error || !data) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      fetchAllSubmissions();
    } catch (error) {
      console.error("Admin check error:", error);
      navigate("/");
    }
  };

  const fetchAllSubmissions = async () => {
    setLoading(true);
    try {
      // Fetch user activities
      const { data: activities, error: activitiesError } = await supabase
        .from("user_activities")
        .select(`
          *,
          profiles(username, email),
          activities(title)
        `)
        .order("submitted_at", { ascending: false });

      if (!activitiesError && activities) {
        setUserActivities(activities);
      }

      // Fetch general submissions
      const { data: general, error: generalError } = await supabase
        .from("general_submissions")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (!generalError && general) {
        setGeneralSubmissions(general);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveActivity = async (activityId: string, pointsToAward: number) => {
    try {
      const { error } = await supabase
        .from("user_activities")
        .update({ 
          status: "approved",
          points_awarded: pointsToAward,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", activityId);

      if (error) throw error;

      toast({ title: "Activity Approved!", description: "Points have been awarded" });
      fetchAllSubmissions();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleRejectActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from("user_activities")
        .update({ 
          status: "rejected",
          reviewed_at: new Date().toISOString()
        })
        .eq("id", activityId);

      if (error) throw error;

      toast({ title: "Activity Rejected" });
      fetchAllSubmissions();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleApproveGeneral = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from("general_submissions")
        .update({ 
          status: "approved",
          points_awarded: 10,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", submissionId);

      if (error) throw error;

      toast({ title: "Submission Approved!" });
      fetchAllSubmissions();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleRejectGeneral = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from("general_submissions")
        .update({ 
          status: "rejected",
          reviewed_at: new Date().toISOString()
        })
        .eq("id", submissionId);

      if (error) throw error;

      toast({ title: "Submission Rejected" });
      fetchAllSubmissions();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getImageUrl = async (path: string, bucket: string) => {
    const { data } = await supabase.storage.from(bucket).createSignedUrl(path.split('/').pop()!, 3600);
    return data?.signedUrl || path;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold text-primary mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Review and approve submissions</p>
        </div>

        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="challenges">Challenge Submissions</TabsTrigger>
            <TabsTrigger value="general">General Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="mt-6">
            <div className="grid gap-4">
              {userActivities.filter(a => a.status === 'pending').length === 0 && (
                <p className="text-center text-muted-foreground py-8">No pending challenge submissions</p>
              )}
              {userActivities.filter(a => a.status === 'pending').map((activity) => (
                <Card key={activity.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{activity.activities?.title || "Activity"}</span>
                      <Badge variant="outline">{activity.status}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>User:</strong> {activity.profiles?.username} ({activity.profiles?.email})
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Description:</strong> {activity.description || "No description"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Submitted:</strong> {new Date(activity.submitted_at).toLocaleString()}
                        </p>
                      </div>
                      {activity.proof_image_url && (
                        <img 
                          src={activity.proof_image_url} 
                          alt="Proof" 
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        onClick={() => handleApproveActivity(activity.id, activity.activities?.points || 10)}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleRejectActivity(activity.id)}
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="general" className="mt-6">
            <div className="grid gap-4">
              {generalSubmissions.filter(s => s.status === 'pending').length === 0 && (
                <p className="text-center text-muted-foreground py-8">No pending general submissions</p>
              )}
              {generalSubmissions.filter(s => s.status === 'pending').map((submission) => (
                <Card key={submission.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>General Submission</span>
                      <Badge variant="outline">{submission.status}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Name:</strong> {submission.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Phone:</strong> {submission.phone_number}
                        </p>
                        {submission.email && (
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Email:</strong> {submission.email}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Action:</strong> {submission.reason}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Submitted:</strong> {new Date(submission.submitted_at).toLocaleString()}
                        </p>
                      </div>
                      {submission.photo_url && (
                        <img 
                          src={submission.photo_url} 
                          alt="Submission" 
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        onClick={() => handleApproveGeneral(submission.id)}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve (+10 pts)
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleRejectGeneral(submission.id)}
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
