import { useDispatch } from 'react-redux';
import { logout } from '../store/store';

export default function Navbar() {

  const dispatch = useDispatch();

  return (
    <div className="bg-white px-6 py-4 shadow flex justify-between">

      <h1 className="font-bold text-xl">
        Production Incentive Management System
      </h1>

      <button
        onClick={() => dispatch(logout())}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>

    </div>
  );
}