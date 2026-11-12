import { request } from "./client";
import type { Participant, Exclusion } from "../types";

type CreateEventResponse = { id: string };

export const addSecretSanta = (
  participants: Participant[],
  exclusions: Exclusion[],
  name: string
) =>
  request<CreateEventResponse>("/secret-santa", {
    method: "POST",
    body: JSON.stringify({
      name,
      participants: participants.map((p) => ({name: p.name })),
      exclusions: exclusions.map(([a, b]) => ({ person_a: a, person_b: b })),
    }),
  });

export const getParticipantByCode = (code: string) =>
  request<Participant[]>(`/secret-santa/${code}`, {
    method: "GET",
  });

export const getBeneficiairefromAPI = (code: string, name: string) =>
  request<{ giftee: string }>(`/beneficiaire/${code}/${name}`, {
    method: "GET",
  }).then((data) => data);

export const getMdp = (code: string, name: string) =>
  request<{ configured_mdp: boolean }>(`/mdp/${code}/${name}`, {
    method: "GET",
  }).then((data) => data);

export const setNewMdp = (code: string, name: string, mdp: string) =>
  request<{ isSet: boolean }>(`/mdp/${code}/${name}/${mdp}`, {
    method: "PUT",
  }).then((data) => data);

export const verifyMdp = (code: string, name: string, mdp: string) =>
  request<{ isValid: boolean }>(`/verify-mdp/${code}/${name}/${mdp}`, {
    method: "GET",
  }).then((data) => data);

export const getNomGroupeByCode = (code: string) =>
  request<{ nomgroupe: string }>(`/nomgroupe/${code}`, {
    method: "GET",
  }).then((data) => data);