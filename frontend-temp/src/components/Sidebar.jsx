import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-md">

      <div className="p-5 border-b">
        <h2 className="text-xl font-bold text-blue-700">
          PIMS
        </h2>
      </div>

      <div className="p-3">

        <NavLink
          to="/"
          className="block p-3 rounded hover:bg-blue-50"
        >
          Dashboard
          <NavLink
  to="/create-entry"
  className="block p-3 rounded hover:bg-blue-50"
>
  Create Entry
</NavLink>
        </NavLink>

      </div>

    </div>
  );
}