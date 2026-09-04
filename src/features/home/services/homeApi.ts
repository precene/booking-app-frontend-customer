import type { HomeApiMovie, HomeCity, HomeShowtime, HomeVenue } from "../types/homeTypes";

import { apiClient } from "#/shared/services/apiClient";
import type { ApiPaginated, ApiResponse, Query } from "#/shared/types";
import { cleanQueryParams } from "#/shared/utils/cleanQueryParams";

type ListMoviesQuery = {
  genre?: string;
  limit?: number;
  page?: number;
  q?: string;
};

type ListVenuesQuery = {
  cityId?: string;
};

type ListShowtimesQuery = {
  date?: string;
  limit?: number;
  movieId?: string;
  page?: number;
  venueId?: string;
};

export const homeApi = {
  listCities: async () => {
    const response = await apiClient.get<ApiResponse<{ cities: HomeCity[] }>>("/cities");

    return response.data.data.cities;
  },

  listMovies: async (query?: ListMoviesQuery) => {
    const response = await apiClient.get<ApiResponse<ApiPaginated<HomeApiMovie>>>("/movies", {
      params: cleanQueryParams((query ?? {}) as Query),
    });

    return response.data.data;
  },

  getMovie: async (id: string) => {
    const response = await apiClient.get<ApiResponse<{ movie: HomeApiMovie }>>(`/movies/${id}`);

    return response.data.data.movie;
  },

  listShowtimes: async (query?: ListShowtimesQuery) => {
    const response = await apiClient.get<ApiResponse<ApiPaginated<HomeShowtime>>>("/shows", {
      params: cleanQueryParams((query ?? {}) as Query),
    });

    return response.data.data;
  },

  listVenues: async (query?: ListVenuesQuery) => {
    const response = await apiClient.get<ApiResponse<{ venues: HomeVenue[] }>>("/venues", {
      params: cleanQueryParams((query ?? {}) as Query),
    });

    return response.data.data.venues;
  },
};
