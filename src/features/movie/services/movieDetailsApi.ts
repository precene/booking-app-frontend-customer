import type {
  HomeApiMovie,
  HomeCity,
  HomeShowtime,
  HomeShowtimeSeatMap,
  HomeVenue,
} from "#/features/home/types/homeTypes";

import { apiClient } from "#/shared/services/apiClient";
import type { ApiPaginated, ApiResponse, Query } from "#/shared/types";
import { cleanQueryParams } from "#/shared/utils/cleanQueryParams";

type ListShowtimesQuery = {
  date?: string;
  limit?: number;
  movieId?: string;
  page?: number;
  venueId?: string;
};

export const movieDetailsApi = {
  getMovie: async (id: string) => {
    const response = await apiClient.get<ApiResponse<{ movie: HomeApiMovie }>>(`/movies/${id}`);

    return response.data.data.movie;
  },

  getShowtimeSeatMap: async (id: string) => {
    const response = await apiClient.get<ApiResponse<HomeShowtimeSeatMap>>(`/shows/${id}/seats`);

    return {
      ...response.data.data,
      byCategory: response.data.data.byCategory ?? [],
      seats: response.data.data.seats ?? [],
    };
  },

  listCities: async () => {
    const response = await apiClient.get<ApiResponse<{ cities: HomeCity[] }>>("/cities");

    return response.data.data.cities ?? [];
  },

  listShowtimes: async (query?: ListShowtimesQuery) => {
    const response = await apiClient.get<ApiResponse<ApiPaginated<HomeShowtime>>>("/shows", {
      params: cleanQueryParams((query ?? {}) as Query),
    });

    return {
      ...response.data.data,
      items: response.data.data.items ?? [],
    };
  },

  listVenues: async () => {
    const response = await apiClient.get<ApiResponse<{ venues: HomeVenue[] }>>("/venues");

    return response.data.data.venues ?? [];
  },
};
