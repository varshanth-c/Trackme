import { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

// UI Components & Icons
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User as UserIcon, Building, Settings as SettingsIcon, LogOut, Save, Loader2 } from 'lucide-react';

const API_BASE_URL = 'https://trackme-yeae.onrender.com/api';

// Define a type for our rich profile state
type Profile = {
  full_name: string | null;
  role: 'admin' | 'staff' | 'vendor' | null;
  specialty: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  business_name: string | null;
  business_type: string | null;
  business_address: string | null;
  preferred_language: string | null;
};

const initialProfileState: Profile = {
  full_name: '', role: 'vendor', specialty: '', phone_number: '', avatar_url: '',
  business_name: '', business_type: '', business_address: '', preferred_language: 'en'
};

export default function Profile() {
  const { toast } = useToast();
  const { user, token, signOut } = useAuth(); // Get user and token from your auth hook
  const isMobile = useIsMobile();

  const [profile, setProfile] = useState<Profile>(initialProfileState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !token) return;
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to fetch profile.");
        const data = await response.json();
        setProfile(data.profile);
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user, token, toast]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfile(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (id: keyof Profile, value: string) => {
    setProfile(prev => ({ ...prev, [id]: value }));
  };

  const handleUpdateProfile = async () => {
    if (!user || !token) return;
    setIsSaving(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(profile),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Update failed.");
        
        toast({ title: "Success!", description: "Your profile has been updated." });
        setProfile(data.profile); // Refresh state with the updated profile from backend
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };
  
  const getInitials = (name: string | null) => (name || '').split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4 md:p-0">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h1 className="text-3xl font-bold">Manage Profile</h1>
            <Button onClick={handleUpdateProfile} disabled={isSaving} className="w-full sm:w-auto">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save All Changes
            </Button>
        </div>
        
        {/* --- Personal Information Card --- */}
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><UserIcon /> Personal Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 col-span-1 md:col-span-2">
                    <Avatar className="h-24 w-24"><AvatarImage src={profile.avatar_url || ''} /><AvatarFallback className="text-3xl">{getInitials(profile.full_name)}</AvatarFallback></Avatar>
                    <p className="text-sm text-muted-foreground">Avatar upload coming soon...</p>
                </div>
                <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" value={user?.email || ''} disabled /></div>
                <div className="space-y-2"><Label htmlFor="full_name">Full Name</Label><Input id="full_name" value={profile.full_name || ''} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label htmlFor="phone_number">Phone Number</Label><Input id="phone_number" value={profile.phone_number || ''} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label htmlFor="vendorspecialty">Specialty (e.g., Finance, Marketing)</Label><Input id="vendorspecialty" value={profile.specialty || ''} onChange={handleInputChange} /></div>
            </CardContent>
        </Card>
        
        {/* --- Business Information Card --- */}
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Building /> Business Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label htmlFor="business_name">Business Name</Label><Input id="business_name" value={profile.business_name || ''} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label htmlFor="business_type">Business Type</Label><Input id="business_type" value={profile.business_type || ''} onChange={handleInputChange} /></div>
                <div className="space-y-2 col-span-1 md:col-span-2"><Label htmlFor="business_address">Business Address</Label><Textarea id="business_address" value={profile.business_address || ''} onChange={handleInputChange} /></div>
            </CardContent>
        </Card>
        
        {/* --- Settings & Preferences Card --- */}
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><SettingsIcon /> Preferences & Access</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2"><Label htmlFor="role">User Role</Label>
                   <Select value={profile.role || 'vendor'} onValueChange={(value) => handleSelectChange('role', value)}>
                       <SelectTrigger><SelectValue /></SelectTrigger>
                       <SelectContent>
                           <SelectItem value="admin">Administrator</SelectItem>
                           <SelectItem value="staff">Staff</SelectItem>
                           <SelectItem value="vendor">Vendor</SelectItem>
                       </SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-2"><Label htmlFor="preferred_language">Preferred Language</Label>
                     <Select value={profile.preferred_language || 'en'} onValueChange={(value) => handleSelectChange('preferred_language', value)}>
                         <SelectTrigger><SelectValue /></SelectTrigger>
                         <SelectContent>
                             <SelectItem value="en">English</SelectItem>
                             <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                             <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
                         </SelectContent>
                     </Select>
                 </div>
            </CardContent>
             <Separator className="my-4"/>
             <CardContent>
                <Button variant="outline" onClick={signOut}><LogOut className="w-4 h-4 mr-2" /> Log Out</Button>
             </CardContent>
        </Card>
    </div>
  );
}
