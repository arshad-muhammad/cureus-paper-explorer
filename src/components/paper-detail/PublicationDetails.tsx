
interface PublicationDetailsProps {
  publicationYear: number | string;
  url: string;
}

const PublicationDetails = ({ publicationYear, url }: PublicationDetailsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Publication Details</h3>
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Journal</label>
            <p className="text-gray-900">Cureus Journal of Medical Science</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Publication Year</label>
            <p className="text-gray-900">{publicationYear}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-600">DOI URL</label>
            <p className="text-blue-600 hover:underline">
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationDetails;
