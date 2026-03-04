import Float "mo:core/Float";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  // Integrate authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  // User profiles storage
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Get caller's user profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  // Get another user's profile (admin only or own profile)
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (caller == user or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Save caller's user profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Ratings System Implementation
  public type RatingSummary = {
    average : Float;
    count : Nat;
  };

  // Map of entityId (movie/actor) to ratings Map (by user principal)
  let ratings = Map.empty<Text, Map.Map<Principal, Nat>>();
  let ratingCounts = Map.empty<Text, Nat>();
  let ratingSums = Map.empty<Text, Nat>();

  // Submit or update rating
  public shared ({ caller }) func submitRating(entityId : Text, rating : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit ratings");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Invalid rating: Must be between 1 and 5");
    };

    switch (ratings.get(entityId)) {
      case (null) {
        // New entity
        let entityRatings = Map.empty<Principal, Nat>();
        entityRatings.add(caller, rating);
        ratings.add(entityId, entityRatings);
        ratingCounts.add(entityId, 1);
        ratingSums.add(entityId, rating);
      };
      case (?entityRatings) {
        switch (entityRatings.get(caller)) {
          case (null) {
            // New rating for user
            entityRatings.add(caller, rating);
            let currentCount = switch (ratingCounts.get(entityId)) {
              case (?count) { count };
              case (null) { 0 };
            };
            ratingCounts.add(entityId, currentCount + 1);
            let currentSum = switch (ratingSums.get(entityId)) {
              case (?sum) { sum };
              case (null) { 0 };
            };
            ratingSums.add(entityId, currentSum + rating);
          };
          case (?oldRating) {
            // Update existing rating
            entityRatings.add(caller, rating);
            let currentSum = switch (ratingSums.get(entityId)) {
              case (?sum) { sum };
              case (null) { 0 };
            };
            let newSum = if (currentSum > 0) {
              if (oldRating <= currentSum) {
                currentSum - oldRating + rating;
              } else {
                rating;
              };
            } else { rating };
            ratingSums.add(entityId, newSum);
          };
        };
      };
    };
  };

  // Get entity rating summary
  public query ({ caller }) func getRating(entityId : Text) : async RatingSummary {
    let count = switch (ratingCounts.get(entityId)) {
      case (?c) { c };
      case (null) { 0 };
    };
    let sum = switch (ratingSums.get(entityId)) {
      case (?s) { s };
      case (null) { 0 };
    };
    let average = if (count > 0) { sum.toFloat() / count.toFloat() } else { 0.0 };
    {
      average;
      count;
    };
  };

  // Get user's rating for an entity
  public query ({ caller }) func getUserRating(entityId : Text) : async ?Nat {
    switch (ratings.get(entityId)) {
      case (?entityRatings) {
        entityRatings.get(caller);
      };
      case (null) { null };
    };
  };
};
