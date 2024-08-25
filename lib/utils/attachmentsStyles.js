export const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 10,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
};

export const focusedStyle = {
  borderColor: '#2196f3',
};

export const attachmentContainerStyle = {
  marginBottom: '20px',
};

export const thumbsContainer = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
};

export const thumb = {
  display: 'inline-flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  boxSizing: 'border-box',
  borderRadius: 10,
  border: '1px solid #eaeaea',
  marginBottom: 8,
  marginRight: 8,
  width: 270,
  height: 100,
  padding: 10,
  position: 'relative',
};

export const removeOneStyle = {
  position: 'absolute',
  top: '2%',
  right: localStorage.getItem('code') === 'en' ? '5%' : '',
  left: localStorage.getItem('code') !== 'en' ? '5%' : '',
  justifyContent: 'center',
  marginTop: '10px',
};
