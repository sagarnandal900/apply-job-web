// Email validation
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Phone validation (10 digits)
export const validatePhone = (phone) => {
  const re = /^\d{10}$/;
  return re.test(phone.replace(/\D/g, ''));
};

// URL validation
export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Date validation (must be 18+ years old)
export const validateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18;
  }
  
  return age >= 18;
};

// Form field validation rules
export const validationRules = {
  fullName: {
    required: 'Full name is required',
    minLength: {
      value: 3,
      message: 'Name must be at least 3 characters'
    }
  },
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email address'
    }
  },
  phone: {
    required: 'Phone number is required',
    pattern: {
      value: /^\d{10}$/,
      message: 'Phone number must be 10 digits'
    }
  },
  dob: {
    required: 'Date of birth is required'
  },
  currentLocation: {
    required: 'Current location is required'
  },
  expectedSalary: {
    required: 'Expected salary is required',
    min: {
      value: 0,
      message: 'Salary cannot be negative'
    }
  },
  experience: {
    required: 'Experience is required',
    min: {
      value: 0,
      message: 'Experience cannot be negative'
    }
  },
  education: {
    required: 'Qualification is required'
  },
  university: {
    required: 'University/College is required'
  }
};
