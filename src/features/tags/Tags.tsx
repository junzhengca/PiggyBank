import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createTag, deleteTag } from '@/store/slices/tagsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Tag } from 'lucide-react';

export default function Tags() {
  const dispatch = useAppDispatch();
  const tags = useAppSelector((state) => state.tags.tags);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createTag(formData));
    setIsOpen(false);
    setFormData({
      name: '',
      color: '#3b82f6',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      dispatch(deleteTag(id));
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Tags</h1>
          <p className="text-sm text-muted-foreground mt-1">Organize transactions with custom tags</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4 mr-2" />
              Add Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tag</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="name">Tag Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Vacation, Business, Food"
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  required
                  className="h-10 w-full"
                />
              </div>
              <Button type="submit" className="w-full shadow-lg">
                Create Tag
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Tag className="h-4 w-4 text-primary" />
            All Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tags.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-3 bg-muted mb-3">
                <Tag className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No tags yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Add your first tag to get started.</p>
            </div>
          ) : (
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {tags.map((tag, index) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 border-b border-border hover:bg-muted/50 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: tag.color + '20' }}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{tag.name}</p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(tag.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
