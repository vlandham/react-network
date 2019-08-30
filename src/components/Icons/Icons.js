import React from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faQuestionCircle,
  faExpandArrowsAlt,
  faSearch,
  faTable,
  faFileDownload,
  faChevronLeft,
  faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Adds subset of Font Awesome fonts to Font Awesome library,
 * as described here:
 * https://github.com/FortAwesome/react-fontawesome#build-a-library-to-reference-icons-throughout-your-app-more-conveniently
 */
export function initLibrary() {
  library.add(
    faQuestionCircle,
    faExpandArrowsAlt,
    faSearch,
    faTable,
    faFileDownload,
    faChevronLeft,
    faExternalLinkAlt,
  );
}

/*
 * Icons for application. Kept in one place to improve reuse
 * and avoid complications of upgrading / changing icon source.
 */

export const HelpIcon = props => <FontAwesomeIcon icon="question-circle" {...props} />;
export const ExpandIcon = props => <FontAwesomeIcon icon="expand-arrows-alt" {...props} />;
export const SearchIcon = props => <FontAwesomeIcon icon="search" {...props} />;
export const TableIcon = props => <FontAwesomeIcon icon="table" {...props} />;
export const DownloadIcon = props => <FontAwesomeIcon icon="file-download" {...props} />;
export const LeftIcon = props => <FontAwesomeIcon icon="chevron-left" {...props} />;
export const ExternalLinkIcon = props => <FontAwesomeIcon icon="external-link-alt" {...props} />;
