import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Legacy InteriorPage wrapper.
 * The old inline subcategory filtering flow has been replaced with the dedicated
 * Category Showcase (/category/interior) and Subcategory Showcase (/category/interior/:subcategorySlug).
 */
export const InteriorPage: React.FC = () => {
  return <Navigate to="/category/interior" replace />;
};

export default InteriorPage;
