namespace SmartDevCo.SchoolSales.Contracts.Enums;

public enum UserRoleType
{
    SuperAdmin = 1,
    SalesManager = 2,
    SalesRepresentative = 3
}

public enum SchoolType
{
    National = 1,
    International = 2,
    Private = 3,
    Language = 4,
    Experimental = 5,
    Other = 6
}

public enum LeadSource
{
    FieldVisit = 1,
    Referral = 2,
    SocialMedia = 3,
    InboundCall = 4,
    Website = 5,
    Exhibition = 6,
    Other = 7
}

public enum SalesStatus
{
    New = 1,
    Assigned = 2,
    Contacted = 3,
    VisitScheduled = 4,
    Visited = 5,
    DemoScheduled = 6,
    ProposalSent = 7,
    Negotiation = 8,
    ClosedWon = 9,
    ClosedLost = 10,
    Inactive = 11
}

public enum ProductInterest
{
    SmartSchool = 1,
    Academy = 2,
    Both = 3,
    Neither = 4
}

public enum VisitOutcomeType
{
    DemoRequested = 1,
    MeetingScheduled = 2,
    ProposalRequested = 3,
    DetailsRequested = 4,
    DecisionMakerNotReached = 5,
    NotInterested = 6,
    FollowUpLater = 7,
    ClosedWon = 8,
    ClosedLost = 9
}

public enum ActivityType
{
    Call = 1,
    Visit = 2,
    Meeting = 3,
    Email = 4,
    WhatsApp = 5,
    Note = 6,
    Reminder = 7
}

public enum FollowUpStatus
{
    Pending = 1,
    InProgress = 2,
    Completed = 3,
    Cancelled = 4
}

public enum FollowUpPriority
{
    Low = 1,
    Medium = 2,
    High = 3,
    Urgent = 4
}

public enum AnswerType
{
    Text = 1,
    Number = 2,
    YesNo = 3,
    SingleChoice = 4,
    MultipleChoice = 5
}

public enum PeriodType
{
    Monthly = 1,
    Quarterly = 2
}

public enum SlideCategory
{
    CompanyOverview = 1,
    SmartSchool = 2,
    Academy = 3,
    ValueProposition = 4,
    Closing = 5
}
