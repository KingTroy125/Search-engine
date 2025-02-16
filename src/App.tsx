import { useState, useCallback } from 'react';
import { Search, Camera } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import debounce from '@/lib/debounce';

interface PexelsImage {
  id: string;
  src: {
    medium: string;
  };
  alt: string;
  photographer: string;
  photographer_url: string;
}

function App() {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState<PexelsImage[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchImages = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setImages([]);
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=24`,
          {
            headers: {
              Authorization: import.meta.env.VITE_PEXELS_API_KEY,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch images');

        const data = await response.json();
        setImages(data.photos);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch images. Please try again.",
          variant: "destructive",
        });
        setImages([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    [toast]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      searchImages(query);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Spotlight Effect */}
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-900 to-black pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0,rgba(255,255,255,0.1),rgba(0,0,0,0))] pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center gap-3 mb-12">
          <Camera className="w-10 h-10" />
          <h1 className="text-5xl font-bold tracking-tight">Lens</h1>
        </div>
        
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-16 group">
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-lg blur-xl opacity-25 group-hover:opacity-50 transition-opacity duration-500" />
          <div className="relative flex gap-2">
            <Input
              type="text"
              placeholder="Search for images..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                searchImages(e.target.value);
              }}
              className="flex-1 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-400 focus-visible:ring-zinc-700"
            />
            <Button 
              type="submit"
              className="bg-white text-black hover:bg-zinc-200 transition-colors"
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden bg-zinc-900/50 border-zinc-800">
                <div className="aspect-[4/3] bg-zinc-800 animate-pulse" />
              </Card>
            ))
          ) : images.length > 0 ? (
            images.map((image) => (
              <Card
                key={image.id}
                className="overflow-hidden group cursor-pointer transition-all duration-500 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
              >
                <a
                  href={image.photographer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="aspect-[4/3] relative">
                    <img
                      src={image.src.medium}
                      alt={image.alt}
                      className="object-cover w-full h-full transition-all duration-500 filter grayscale group-hover:grayscale-0 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),rgba(0,0,0,0))]" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white text-sm font-medium">
                          Photo by {image.photographer}
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              </Card>
            ))
          ) : query.trim() ? (
            <div className="col-span-full text-center py-12">
              <p className="text-zinc-400">No images found for "{query}"</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default App;