import ImageWithSkeleton from '../skeletons/ImageWithSkeleton';

import editIcon from '../../../assets/images/edit-icon.svg';
import deleteIcon from '../../../assets/images/delete-icon.svg';
import viewIcon from '../../../assets/images/view-icon.svg';
import viewPDFIcon from '../../../assets/images/h-4.svg';
// import moreActionIcon from '../../../assets/images/morecircle.svg';
import moreActionIcon from '../../../assets/images/more-action.svg';
import copyIcon from '../../../assets/images/copy.svg';
import refreshIcon from '../../../assets/images/h-2.svg';
import filterIcon from '../../../assets/images/filter-icon-tb.svg';
import arrowIcon from '../../../assets/images/arrow-tb-down.svg';
import MobileSearch from '../../../assets/images/mobile-icon-search.svg';
import studentGroup from '../../../assets/images/studentsGrp.svg';
import attendance from '../../../assets/images/attendance.svg';

export const ViewIcon = () => <ImageWithSkeleton imgSrc={viewIcon} imgAlt="view-icon" isListIcon={true} />;
export const ViewPDFIcon = () => <ImageWithSkeleton imgSrc={viewPDFIcon} imgAlt="view-pdf-icon" isListIcon={true} />;
export const EditIcon = () => <ImageWithSkeleton imgSrc={editIcon} imgAlt="edit-icon" isListIcon={true} />;
export const DeleteIcon = () => <ImageWithSkeleton imgSrc={deleteIcon} imgAlt="delete-icon" isListIcon={true} />;
export const CopyIcon = () => <ImageWithSkeleton imgSrc={copyIcon} imgAlt="copy-icon" isListIcon={true} />;
export const MoreActionIcon = () => <ImageWithSkeleton imgSrc={moreActionIcon} imgAlt="more-action-icon" isListIcon={true} />;
export const RefreshIcon = () => <ImageWithSkeleton imgSrc={refreshIcon} imgAlt="refresh-icon" isListIcon={true} />;
export const FilterIcon = () => <ImageWithSkeleton imgSrc={filterIcon} imgAlt="filter-icon" isListIcon={true} />;
export const ToggleIcon = () => <ImageWithSkeleton imgSrc={arrowIcon} imgAlt="toggle-icon" isListIcon={true} />;
export const MobileSearchIcon = () => <ImageWithSkeleton imgSrc={MobileSearch} imgAlt="search-icon" isListIcon={true} />;
export const StudentGroupIcon = () => <ImageWithSkeleton imgSrc={studentGroup} imgAlt="view-student-list" isListIcon={true} />;
export const AttendanceIcon = () => <ImageWithSkeleton imgSrc={attendance} imgAlt="view-icon" isListIcon={true} />;
