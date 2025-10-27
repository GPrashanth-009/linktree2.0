import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileSectionProps {
  name: string;
  bio: string;
  avatarUrl?: string;
}

export const ProfileSection = ({ name, bio, avatarUrl }: ProfileSectionProps) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center text-center space-y-4 mb-8">
      <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-lg">
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">{name}</h1>
        <p className="text-muted-foreground max-w-md">{bio}</p>
      </div>
    </div>
  );
};
