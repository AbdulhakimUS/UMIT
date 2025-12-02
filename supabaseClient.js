
// ЗАМЕНИТЕ НА ВАШИ ДАННЫЕ ИЗ SUPABASE
const SUPABASE_URL = 'https://vaonhuhucuiqcaeuyzaz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhb25odWh1Y3VpcWNhZXV5emF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTAyNTAsImV4cCI6MjA4MDI2NjI1MH0.VbOCsY035tlHao39hW0LSh8U-Ci6_Eo7kF7vBDa04LI';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
