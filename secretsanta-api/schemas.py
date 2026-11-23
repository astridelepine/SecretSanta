from pydantic import BaseModel


class ParticipantIn(BaseModel):
    name: str

class ExclusionIn(BaseModel):
    person_a: str
    person_b: str

class EventCreate(BaseModel):
    name: str
    participants: list[ParticipantIn]
    exclusions: list[ExclusionIn]

class CreateEventResponse(BaseModel):
    id: str 