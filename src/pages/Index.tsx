import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LinkCard } from "@/components/LinkCard";
import { AddLinkDialog } from "@/components/AddLinkDialog";
import { EditLinkDialog } from "@/components/EditLinkDialog";
import { ProfileSection } from "@/components/ProfileSection";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";

interface Link {
  id: string;
  title: string;
  url: string;
  logo_url?: string | null;
}

interface Profile {
  full_name: string;
  bio: string | null;
  avatar_url: string | null;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Auth state management
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Load profile and links when user is authenticated
  useEffect(() => {
    if (user) {
      loadProfile();
      loadLinks();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, bio, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error loading profile:", error);
      return;
    }

    setProfile(data);
  };

  const loadLinks = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading links:", error);
      toast.error("Failed to load links");
      return;
    }

    setLinks(data || []);
  };

  const fetchLogo = async (url: string): Promise<string> => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch (error) {
      console.error("Error fetching logo:", error);
      return "";
    }
  };

  const handleAddLink = async (title: string, url: string) => {
    if (!user) return;

    const logo_url = await fetchLogo(url);

    const { data, error } = await supabase
      .from("links")
      .insert({
        user_id: user.id,
        title,
        url,
        logo_url,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding link:", error);
      toast.error("Failed to add link");
      return;
    }

    setLinks([...links, data]);
    toast.success("Link added successfully!");
  };

  const handleEditLink = async (id: string, title: string, url: string) => {
    const { error } = await supabase
      .from("links")
      .update({ title, url })
      .eq("id", id);

    if (error) {
      console.error("Error updating link:", error);
      toast.error("Failed to update link");
      return;
    }

    setLinks(links.map(link => 
      link.id === id ? { ...link, title, url } : link
    ));
    toast.success("Link updated successfully!");
  };

  const handleDeleteLink = async (id: string) => {
    const { error } = await supabase
      .from("links")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting link:", error);
      toast.error("Failed to delete link");
      return;
    }

    setLinks(links.filter(link => link.id !== id));
    toast.success("Link removed successfully!");
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to logout");
      return;
    }
    toast.success("Logged out successfully!");
    navigate("/auth");
  };

  const openEditDialog = (link: Link) => {
    setEditingLink(link);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      
      <main className="relative container max-w-2xl mx-auto px-4 py-12">
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <ProfileSection
          name={profile.full_name}
          bio={profile.bio || "Welcome to my link tree!"}
          avatarUrl={profile.avatar_url || undefined}
        />

        <div className="space-y-4 mb-6">
          {links.map(link => (
            <LinkCard
              key={link.id}
              id={link.id}
              title={link.title}
              url={link.url}
              logo_url={link.logo_url}
              onEdit={() => openEditDialog(link)}
              onDelete={() => handleDeleteLink(link.id)}
            />
          ))}
        </div>

        <AddLinkDialog onAdd={handleAddLink} />

        <EditLinkDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          link={editingLink}
          onSave={handleEditLink}
        />
      </main>
    </div>
  );
};

export default Index;
