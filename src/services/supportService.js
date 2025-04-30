export const supportService = {
  sendSupportRequest: async (data) => {
    //console.log("Sending support request:", data);
    return { success: true, message: "Support request sent successfully" };
  },

  // Get support requests (for admin)
  getSupportRequests: async (page = 1, limit = 10) => {
    //console.log("Fetching support requests:", { page, limit });
    return {
      data: [],
      totalPages: 0,
      currentPage: page,
      totalItems: 0,
    };
  },

  // Update support request status
  updateRequestStatus: async (requestId, status) => {
    //console.log("Updating request status:", { requestId, status });
    return { success: true, message: "Status updated successfully" };
  },

  // Add admin response to a support request
  addResponse: async (requestId, responseText) => {
    //console.log("Adding response to request:", { requestId, responseText });
    return { success: true, message: "Response added successfully" };
  },
};
