## **🧪 Full Stack Engineer Technical Assessment**

### **📝 Overview**

You are tasked with building a **Mini Job Board Application**. This app
allows employers to post job listings and applicants to browse and
apply. You’ll use **Laravel** for the backend and **Vue, React, or
Angular** for the frontend (your choice).

## **📌 Requirements**

### **🔧 Backend (Laravel)**

Create a RESTful API with the following:

1.  **Authentication  
    **

    - Register/Login using email and password

    - Use Laravel Sanctum or Passport

2.  **Roles  
    **

    - Two roles: employer, applicant

    - Middleware protection for endpoints

3.  **Job Listings  
    **

    - employer can: Create, Edit, Delete, View own jobs

    - applicant can: Browse all published jobs

    - Fields: title, description, location, salary_range, is_remote,
      status

4.  **Job Applications  
    **

    - applicant can apply to a job with a short message

    - An employer can view applicants for their jobs

5.  **API Standards  
    **

    - Use proper REST conventions

    - Return JSON responses

    - Include validation and error handling

### **🎨 Frontend (Vue/React/Angular)**

Choose **one** modern frontend framework. Your frontend should:

1.  **Login/Register Pages  
    **

    - With client-side validation

2.  **Dashboard  
    **

    - Show different content for employers vs applicants

3.  **Job Listing & Application  
    **

    - Applicants: View job board, apply to a job

    - Employers: CRUD jobs, view applicants

4.  **State Management  
    **

    - Use context/store (e.g., Pinia, Redux, NgRx, etc.)

5.  **API Integration  
    **

    - Connect with Laravel backend via Axios/Fetch

6.  **UI Frameworks  
    **

    - Tailwind, Vuetify, Chakra UI, Material UI, etc. are acceptable

## **🧪 Bonus Tasks**

(Optional, but earns extra points)

- Implement **email notifications** (e.g., on application submitted)

- Add **pagination** to job listings

- Add **file upload** for resume

- Add **unit or feature tests** (backend or frontend)

## **🗂 Deliverables**

- GitHub repo with:

  - README.md describing setup, tech stack, instructions

  - backend/ (Laravel project)

  - frontend/ (your chosen framework)

- Include a Postman or Insomnia collection for API testing

## **🧠 Evaluation Criteria**

| **Category**               | **Points** |
|----------------------------|------------|
| Laravel Backend Design     | 20         |
| API and Auth Logic         | 20         |
| Frontend UI/UX             | 20         |
| Integration/API Usage      | 20         |
| Code Structure/Cleanliness | 10         |
| Bonus Tasks                | 10         |
| **Total**                  | **100**    |
