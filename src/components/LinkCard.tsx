import { MoreVertical, Edit, Trash2, ExternalLink, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";

interface LinkCardProps {
  id: string;
  title: string;
  url: string;
  logo_url?: string | null;
  onEdit: () => void;
  onDelete: () => void;
}

export const LinkCard = ({ title, url, logo_url, onEdit, onDelete }: LinkCardProps) => {
  const handleLinkClick = () => {
    window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
  };

  return (
    <Card className="relative group overflow-hidden backdrop-blur-md bg-card/80 border-border/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={handleLinkClick}
          className="flex-1 flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
            {logo_url ? (
              <img
                src={logo_url}
                alt={`${title} logo`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = parent.querySelector('.fallback-icon') as HTMLElement;
                    if (fallback) fallback.classList.remove('hidden');
                  }
                }}
              />
            ) : null}
            <Globe className={`fallback-icon w-5 h-5 text-muted-foreground ${logo_url ? 'hidden' : ''}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{title}</h3>
            <p className="text-sm text-muted-foreground truncate">{url}</p>
          </div>
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover backdrop-blur-md">
            <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};
