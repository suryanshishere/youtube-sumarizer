import React from "react";
import UrlInput from "./UrlInput";

function App() {
  return (
    <div className="w-full min-h-screen   flex justify-center items-center">
      <div className=" w-1/3 flex flex-col justify-center gap-4 items-center">
        {/* <img
          src="https://cdn.prod.website-files.com/6462655e6f1811aabe80d8bd/663cb5b1f782414f80b98655_5%20best%20YouTube%20video%20summarizer%20AI%20tools-1.png"
          alt="youtube-summariser-icon"
          className="rounded-full"
        /> */}
        <UrlInput />
        {/* <div className="">
          <h2>Summary</h2>
          <p className="w-full">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eveniet
            officiis facilis eligendi reprehenderit laboriosam. Atque minus, sed
            reiciendis, velit eaque assumenda provident laboriosam repellat
            magnam et nostrum libero recusandae quis. Lorem ipsum dolor sit
            amet, consectetur adipisicing elit. Quo nisi quod atque voluptas
            voluptatem, ex, esse nam animi fuga quisquam dicta excepturi sunt
            corrupti est praesentium dolorem quaerat obcaecati repellat?
          </p>
        </div> */}
      </div>
    </div>
  );
}

export default App;
