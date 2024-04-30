import React from "react";

const Badge = ({ ranking }) => {
  return (
    <div className="relative z-10 md:h-16 md:w-16 h-14 w-14 text-zinc-700 flex items-center justify-center transition-colors duration-300">
      <svg
        className="group"
        width="84"
        height="99"
        viewBox="0 0 84 99"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="badge_ribbon fill-zinc-800/50 group-hover:fill-red-700 transistion-colors duration-500"
          d="M0.761166 82.9447L17.3041 50.8886C17.5574 50.3979 18.1606 50.2053 18.6513 50.4586L43.875 63.4756C44.3658 63.7289 44.5583 64.332 44.305 64.8228L27.7788 96.8466C27.4294 97.5236 26.4817 97.5769 26.0586 96.9435L17.8756 84.694C17.6881 84.4133 17.3716 84.2461 17.0341 84.2495L1.65981 84.4033C0.906487 84.4108 0.415676 83.6142 0.761166 82.9447Z"
        ></path>
        <path
          className="badge_ribbon fill-zinc-800/50 group-hover:fill-red-700 transistion-colors duration-500"
          d="M0.761166 82.9447L17.3041 50.8886C17.5574 50.3979 18.1606 50.2053 18.6513 50.4586L43.875 63.4756C44.3658 63.7289 44.5583 64.332 44.305 64.8228L27.7788 96.8466C27.4294 97.5236 26.4817 97.5769 26.0586 96.9435L17.8756 84.694C17.6881 84.4133 17.3716 84.2461 17.0341 84.2495L1.65981 84.4033C0.906487 84.4108 0.415676 83.6142 0.761166 82.9447Z"
        ></path>
        <path
          className="badge_ribbon right fill-zinc-800/50 group-hover:fill-red-700 transistion-colors duration-500"
          d="M56.5365 97.1074L38.5 65.8673C38.2239 65.389 38.3877 64.7774 38.866 64.5013L63.4476 50.3091C63.9259 50.0329 64.5375 50.1968 64.8137 50.6751L82.832 81.8838C83.2129 82.5435 82.7458 83.3698 81.9841 83.3836L67.2552 83.6511C66.9177 83.6572 66.6061 83.8332 66.4266 84.1191L58.2494 97.1392C57.8487 97.7772 56.9132 97.7598 56.5365 97.1074Z"
        ></path>
        <path
          className="badge_ribbon right fill-zinc-800/50 group-hover:fill-red-700 transistion-colors duration-500"
          d="M56.5365 97.1074L38.5 65.8673C38.2239 65.389 38.3877 64.7774 38.866 64.5013L63.4476 50.3091C63.9259 50.0329 64.5375 50.1968 64.8137 50.6751L82.832 81.8838C83.2129 82.5435 82.7458 83.3698 81.9841 83.3836L67.2552 83.6511C66.9177 83.6572 66.6061 83.8332 66.4266 84.1191L58.2494 97.1392C57.8487 97.7772 56.9132 97.7598 56.5365 97.1074Z"
        ></path>
        <circle
          cx="40.5"
          cy="37.5"
          r="33.5"
          fill="#18181bcc"
          stroke="#18181bcc"
          strokeWidth="2"
        ></circle>
        <circle
          className="badge_circle"
          cx="40.5"
          cy="37.5"
          r="29.5"
          fill="#000000"
        ></circle>
        <defs>
          <linearGradient
            id="paint0_linear"
            x1="31.2632"
            y1="56.9671"
            x2="13.7695"
            y2="90.8654"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#A31523"></stop>
            <stop offset="1" stopColor="#e80020" stopOpacity="0"></stop>
          </linearGradient>
          <linearGradient
            id="paint1_linear"
            x1="31.2632"
            y1="56.9671"
            x2="13.7695"
            y2="90.8654"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#27539F"></stop>
            <stop offset="1" stopColor="#71A1F4" stopOpacity="0"></stop>
          </linearGradient>
          <linearGradient
            id="paint2_linear"
            x1="51.1568"
            y1="57.4052"
            x2="70.2299"
            y2="90.4407"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#A31523"></stop>
            <stop offset="1" stopColor="#e80020" stopOpacity="0"></stop>
          </linearGradient>
          <linearGradient
            id="paint3_linear"
            x1="51.1568"
            y1="57.4052"
            x2="70.2299"
            y2="90.4407"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#27539F"></stop>
            <stop offset="1" stopColor="#71A1F4" stopOpacity="0"></stop>
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 bottom-4 right-0.5 flex items-center justify-center text-xl font-bold group-hover:text-zinc-300 transition-colors duration-500">
        {ranking}
      </span>
    </div>
  );
};

export default Badge;
