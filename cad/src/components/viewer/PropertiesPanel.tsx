"use client";

export type PropertyGroup = {
  groupName: string;
  properties: { name: string; value: string }[];
};

type Props = {
  properties: PropertyGroup[];
  selectedId: number | null;
};

export function PropertiesPanel({ properties, selectedId }: Props) {
  return (
    <div className="p-2">
      <h3 className="text-sm font-semibold px-2 py-2 text-gray-400 uppercase tracking-wider">
        プロパティ
      </h3>

      {selectedId === null ? (
        <p className="text-gray-500 text-sm px-2 py-4">
          要素をクリックして選択してください
        </p>
      ) : (
        <div className="space-y-3">
          {properties.map((group) => (
            <div key={group.groupName} className="bg-gray-700/50 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                {group.groupName}
              </h4>
              <div className="space-y-1">
                {group.properties.map((prop) => (
                  <div
                    key={prop.name}
                    className="flex justify-between text-sm gap-2"
                  >
                    <span className="text-gray-400 shrink-0">{prop.name}</span>
                    <span className="text-gray-200 text-right truncate">
                      {prop.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
