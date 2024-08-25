import ImageWithSkeleton from '../skeletons/ImageWithSkeleton';

// import moreActionIcon from '../../../assets/images/morecircle.svg';
import moreActionIcon from '../../../assets/images/more-action.svg';
import refreshIcon from '../../../assets/images/h-2.svg';
import filterIcon from '../../../assets/images/filter-icon-tb.svg';
import arrowIcon from '../../../assets/images/arrow-tb-down.svg';
import MobileSearch from '../../../assets/images/mobile-icon-search.svg';
import studentGroup from '../../../assets/images/studentsGrp.svg';
import attendance from '../../../assets/images/attendance.svg';
import DeleteIcons from '../../../assets/svgs/DeleteIcon';
import NewCopyIcon from '../../../assets/svgs/NewCopyIcon';
const NewViewIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
      <path
        d="M10.1001 12.1C10.1001 12.6305 10.3108 13.1392 10.6859 13.5142C11.061 13.8893 11.5697 14.1 12.1001 14.1C12.6305 14.1 13.1392 13.8893 13.5143 13.5142C13.8894 13.1392 14.1001 12.6305 14.1001 12.1C14.1001 11.5696 13.8894 11.0609 13.5143 10.6858C13.1392 10.3108 12.6305 10.1 12.1001 10.1C11.5697 10.1 11.061 10.3108 10.6859 10.6858C10.3108 11.0609 10.1001 11.5696 10.1001 12.1Z"
        stroke="#151538"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.1001 12.1C18.7001 16.1 15.7001 18.1 12.1001 18.1C8.5001 18.1 5.5001 16.1 3.1001 12.1C5.5001 8.10004 8.5001 6.10004 12.1001 6.10004C15.7001 6.10004 18.7001 8.10004 21.1001 12.1Z"
        stroke="#151538"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
  const NewEditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
      <path
        d="M7.1001 7.10002H6.1001C5.56966 7.10002 5.06096 7.31073 4.68588 7.68581C4.31081 8.06088 4.1001 8.56959 4.1001 9.10002V18.1C4.1001 18.6305 4.31081 19.1392 4.68588 19.5142C5.06096 19.8893 5.56966 20.1 6.1001 20.1H15.1001C15.6305 20.1 16.1392 19.8893 16.5143 19.5142C16.8894 19.1392 17.1001 18.6305 17.1001 18.1V17.1M16.1001 5.10002L19.1001 8.10002M20.4851 6.68502C20.8789 6.29118 21.1002 5.757 21.1002 5.20002C21.1002 4.64304 20.8789 4.10887 20.4851 3.71502C20.0913 3.32118 19.5571 3.09991 19.0001 3.09991C18.4431 3.09991 17.9089 3.32118 17.5151 3.71502L9.1001 12.1V15.1H12.1001L20.4851 6.68502Z"
        stroke="#151538"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
  const NewViewPdfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
      <path
        d="M17.1001 17.1H19.1001C19.6305 17.1 20.1392 16.8893 20.5143 16.5142C20.8894 16.1392 21.1001 15.6305 21.1001 15.1V11.1C21.1001 10.5696 20.8894 10.0609 20.5143 9.68582C20.1392 9.31075 19.6305 9.10004 19.1001 9.10004H5.1001C4.56966 9.10004 4.06096 9.31075 3.68588 9.68582C3.31081 10.0609 3.1001 10.5696 3.1001 11.1V15.1C3.1001 15.6305 3.31081 16.1392 3.68588 16.5142C4.06096 16.8893 4.56966 17.1 5.1001 17.1H7.1001M17.1001 9.10004V5.10004C17.1001 4.5696 16.8894 4.0609 16.5143 3.68582C16.1392 3.31075 15.6305 3.10004 15.1001 3.10004H9.1001C8.56966 3.10004 8.06096 3.31075 7.68588 3.68582C7.31081 4.0609 7.1001 4.5696 7.1001 5.10004V9.10004M7.1001 15.1C7.1001 14.5696 7.31081 14.0609 7.68588 13.6858C8.06096 13.3108 8.56966 13.1 9.1001 13.1H15.1001C15.6305 13.1 16.1392 13.3108 16.5143 13.6858C16.8894 14.0609 17.1001 14.5696 17.1001 15.1V19.1C17.1001 19.6305 16.8894 20.1392 16.5143 20.5142C16.1392 20.8893 15.6305 21.1 15.1001 21.1H9.1001C8.56966 21.1 8.06096 20.8893 7.68588 20.5142C7.31081 20.1392 7.1001 19.6305 7.1001 19.1V15.1Z"
        stroke="#151538"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
  
  const NewAddIcon = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="feather feather-plus"
      >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    );
  };

  export const ViewIcon = () => <NewViewIcon />;
  export const ViewPDFIcon = () => <NewViewPdfIcon />;
  export const EditIcon = () => <NewEditIcon />;
  export const DeleteIcon = () => <DeleteIcons />;
  export const NewDeleteIcon = () => <DeleteIcons />;
  export const CopyIcon = () => <NewCopyIcon />;
export const MoreActionIcon = () => <ImageWithSkeleton imgSrc={moreActionIcon} imgAlt="more-action-icon" isListIcon={true} />;
export const RefreshIcon = () => <ImageWithSkeleton imgSrc={refreshIcon} imgAlt="refresh-icon" isListIcon={true} />;
export const FilterIcon = () => <ImageWithSkeleton imgSrc={filterIcon} imgAlt="filter-icon" isListIcon={true} />;
export const ToggleIcon = () => <ImageWithSkeleton imgSrc={arrowIcon} imgAlt="toggle-icon" isListIcon={true} />;
export const MobileSearchIcon = () => <ImageWithSkeleton imgSrc={MobileSearch} imgAlt="search-icon" isListIcon={true} />;
export const StudentGroupIcon = () => <ImageWithSkeleton imgSrc={studentGroup} imgAlt="view-student-list" isListIcon={true} />;
export const AttendanceIcon = () => <ImageWithSkeleton imgSrc={attendance} imgAlt="view-icon" isListIcon={true} />;
export const SnapShotIcon = () => <FaCamera size={24} />;
export const AddIcon = () => <NewAddIcon />;