
import { Users } from 'lucide-react';
import AuthorCard from './AuthorCard';

interface EnhancedAuthor {
  name: string;
  email?: string | null;
  source?: string;
  confidence?: number;
}

interface AuthorsSectionProps {
  authors: EnhancedAuthor[];
  isEnhanced: boolean;
}

const AuthorsSection = ({ authors, isEnhanced }: AuthorsSectionProps) => {
  if (authors.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <Users className="h-5 w-5 mr-2 text-blue-600" />
        Authors ({authors.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {authors.map((author, index) => (
          <AuthorCard 
            key={index} 
            author={author} 
            isEnhanced={isEnhanced}
          />
        ))}
      </div>
    </div>
  );
};

export default AuthorsSection;
