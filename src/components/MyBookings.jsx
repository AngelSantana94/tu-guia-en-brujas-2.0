import React, { useEffect, useState } from "react";
import BookingCard from "./BookingCard";
import { supabase } from "../lib/supabaseClient";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

